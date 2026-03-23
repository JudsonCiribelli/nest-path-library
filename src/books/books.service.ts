import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async listAllBooks(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const allBooks = await this.prisma.book.findMany({
      take: limit,
      skip: offset,
      where: {
        status: 'AVAILABLE',
      },
    });

    return allBooks;
  }

  async findOneBook(id: string) {
    const bookExist = await this.prisma.book.findUnique({
      where: {
        id: id,
      },
    });

    if (!bookExist) {
      throw new HttpException('Livro não encontrado!', HttpStatus.NOT_FOUND);
    }

    return bookExist;
  }

  async createNewBook(createBookDto: CreateBookDto, userId: string) {
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
  }

  async deleteABook(id: string) {
    const bookExist = await this.prisma.book.delete({
      where: {
        id: id,
      },
    });

    if (!bookExist) {
      throw new HttpException('Livro não encontrado!', HttpStatus.NOT_FOUND);
    }

    console.log(bookExist);
    return bookExist;
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
}
