import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

  async getAuthors() {
    return await this.prisma.author.findMany();
  }

  async registerAuthor(createAuthorDto: CreateAuthorDto) {
    const normalizedName = createAuthorDto.name.toLowerCase().trim();

    const authorExists = await this.prisma.author.findFirst({
      where: {
        name: normalizedName,
      },
    });

    if (authorExists) {
      throw new ConflictException(
        'Já existe um autor cadastrado com este nome.',
      );
    }

    try {
      await this.prisma.author.create({
        data: {
          ...createAuthorDto,
          name: normalizedName,
          birthDate: new Date(createAuthorDto.birthDate),
        },
      });
    } catch (error) {
      console.log('Error registerAuthor:' + error);
      throw new HttpException(
        'Erro ao cadastrar autor',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteAuthor(id: string) {
    try {
      return await this.prisma.author.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Autor não encontrado para exclusão.');
      }
      console.log('Error deleteAuthor:' + error);
      throw new BadRequestException('Erro ao deletar autor.');
    }
  }

  async getAuthorDetails(authorId: string) {
    try {
      const author = await this.prisma.author.findUnique({
        where: {
          id: authorId,
        },
        include: {
          books: {
            select: {
              title: true,
              description: true,
              pages: true,
              year: true,
              status: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!author) {
        throw new NotFoundException('Autor não encontrado.');
      }

      return author;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Erro ao obter detalhes do autor.');
    }
  }

  async updateAuthor(id: string, updateAuthorDTO: CreateAuthorDto) {
    try {
      const authorExists = await this.prisma.author.findUnique({
        where: {
          id,
        },
      });

      if (!authorExists) {
        throw new NotFoundException('Autor não encontrado para atualização.');
      }

      const dataAuthor: {
        name?: string;
        bio?: string;
        birthDate?: Date;
      } = {
        name: updateAuthorDTO.name,
        bio: updateAuthorDTO.bio,
        birthDate: updateAuthorDTO.birthDate,
      };

      const author = await this.prisma.author.update({
        where: {
          id: authorExists.id,
        },
        data: {
          name: dataAuthor.name,
          bio: dataAuthor.bio,
          birthDate: dataAuthor.birthDate
            ? new Date(dataAuthor.birthDate)
            : authorExists.birthDate,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Erro ao atualizar autor',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
