import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

  async getAuthors() {
    const authors = await this.prisma.author.findMany({});

    if (!authors) {
      throw new HttpException('Nenhum autor cadastradi', HttpStatus.NOT_FOUND);
    }

    return authors;
  }

  async registerAuthor(createAuthorDto: CreateAuthorDto) {
    const normalizedName = createAuthorDto.name.toLowerCase().trim();

    const authorExists = await this.prisma.author.findFirst({
      where: {
        name: normalizedName,
      },
    });

    if (authorExists) {
      throw new HttpException(
        'Já existe um autor cadastrado com este nome.',
        HttpStatus.CONFLICT,
      );
    }

    const author = await this.prisma.author.create({
      data: {
        name: normalizedName,
        bio: createAuthorDto.bio,
        birthDate: new Date(createAuthorDto.birthDate),
      },
    });

    if (!author) {
      throw new HttpException(
        'Erro ao cadastrar autor',
        HttpStatus.BAD_REQUEST,
      );
    }

    return author;
  }

  async deleteAuthor(id: string) {
    const author = await this.prisma.author.findUnique({
      where: {
        id: id,
      },
    });

    if (!author) {
      return new HttpException('Autor não encontrado', HttpStatus.NOT_FOUND);
    }

    const authorDeleted = await this.prisma.author.delete({
      where: {
        id: author.id,
      },
    });

    return authorDeleted;
  }
}
