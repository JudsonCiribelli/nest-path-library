import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

  async getAuthors() {
    return await this.prisma.author.findMany({
      include: {
        books: {
          include: {
            category: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });
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
      return await this.prisma.author.create({
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

      await this.prisma.author.update({
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

  async uploadAuthorImage(authorImage: Express.Multer.File, authorId: string) {
    try {
      const author = await this.prisma.author.findUnique({
        where: {
          id: authorId,
        },
      });

      if (!author) {
        throw new NotFoundException('Autor não encontrado.');
      }

      const authorName = author.name.trim();
      const extensionName = path
        .extname(authorImage.originalname)
        .toLowerCase()
        .substring(1);

      const fileName = `${authorName}-${author.id}.${extensionName}`;
      const fileLocale = path.resolve(process.cwd(), 'files', fileName);

      await fs.writeFile(fileLocale, authorImage.buffer);

      await this.prisma.author.update({
        where: {
          id: author.id,
        },
        data: {
          authorImage: fileName,
        },
      });

      return 'Imagem cadastrada com sucesso.';
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error ao cadastras imagem.');
    }
  }
}
