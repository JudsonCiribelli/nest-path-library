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
}
