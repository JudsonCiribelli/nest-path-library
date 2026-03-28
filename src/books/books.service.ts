import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async listAllBooks(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.prisma.book.findMany({
      take: limit,
      skip: offset,
      where: {
        status: 'AVAILABLE',
      },
    });
  }

  async findOneBook(bookId: string) {
    const bookExist = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!bookExist) {
      throw new HttpException('Livro não encontrado!', HttpStatus.NOT_FOUND);
    }

    return bookExist;
  }

  async createNewBook(createBookDto: CreateBookDto) {
    try {
      const book = await this.prisma.book.create({
        data: {
          title: createBookDto.title,
          authorId: createBookDto.authorId,
          description: createBookDto.description,
          categoryId: createBookDto.categoryId,
          pages: createBookDto.pages,
          year: createBookDto.year,
        },
      });

      return book;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Erro ao tentar criar um novo livro!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteABook(bookId: string) {
    const bookExist = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!bookExist) {
      throw new HttpException('Livro não encontrado!', HttpStatus.NOT_FOUND);
    }

    if (bookExist.status === 'BORROWED') {
      throw new ConflictException('Este livro não pode ser deletado.');
    }

    try {
      return await this.prisma.book.delete({
        where: {
          id: bookId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Erro ao tentar excluir o livro!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findBooksByCategory(categoryId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const books = await this.prisma.book.findMany({
      take: limit,
      skip: offset,
      where: {
        categoryId: categoryId,
      },
    });

    if (books.length === 0) {
      throw new HttpException(
        'Nenhum livro encontrado para esta categoria!',
        HttpStatus.NOT_FOUND,
      );
    }

    return books;
  }

  async findBooksByAuthor(authorId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const books = await this.prisma.book.findMany({
      take: limit,
      skip: offset,
      where: {
        authorId: authorId,
      },
    });

    if (books.length === 0) {
      throw new HttpException(
        'Nenhum livro encontrado para este autor!',
        HttpStatus.NOT_FOUND,
      );
    }

    return books;
  }
}
