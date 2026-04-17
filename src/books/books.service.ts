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
import { CreateBookDto } from './dto/create-book.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ResponseBooksDto } from './dto/response-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async listAllBooks(
    paginationDto: PaginationDto,
  ): Promise<ResponseBooksDto[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.prisma.book.findMany({
      take: limit,
      skip: offset,
      where: {
        status: 'AVAILABLE',
      },
      include: {
        author: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
  }

  async findOneBook(bookId: string): Promise<ResponseBooksDto> {
    const bookExist = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!bookExist) {
      throw new HttpException('Livro não encontrado!', HttpStatus.NOT_FOUND);
    }

    return bookExist;
  }

  async createNewBook(createBookDto: CreateBookDto): Promise<ResponseBooksDto> {
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

  async deleteABook(bookId: string): Promise<ResponseBooksDto> {
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

  async findBooksByCategory(
    categoryId: string,
    paginationDto: PaginationDto,
  ): Promise<ResponseBooksDto[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const books = await this.prisma.book.findMany({
      take: limit,
      skip: offset,
      where: {
        categoryId: categoryId,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
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

  async findBooksByAuthor(
    authorId: string,
    paginationDto: PaginationDto,
  ): Promise<ResponseBooksDto[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const books = await this.prisma.book.findMany({
      take: limit,
      skip: offset,
      where: {
        authorId: authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            name: true,
            id: true,
          },
        },
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

  async uploadBookImage(bookImage: Express.Multer.File, bookId: string) {
    try {
      const book = await this.prisma.book.findUnique({
        where: {
          id: bookId,
        },
      });

      if (!book) {
        throw new NotFoundException('Livro não encontrado!');
      }

      const bookTitle = book.title.trim();

      const extensionName = path
        .extname(bookImage.originalname)
        .toLowerCase()
        .substring(1);
      const fileName = `${bookTitle}-${book.id}.${extensionName}`;
      const fileLocale = path.resolve(process.cwd(), 'files', fileName);

      await fs.writeFile(fileLocale, bookImage.buffer);

      await this.prisma.book.update({
        where: {
          id: book.id,
        },
        data: {
          bookImage: fileName,
        },
      });

      return 'Imagem cadastrada com sucesso';
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error ao cadastrar imagem.');
    }
  }

  async findBookByTitle(title?: string) {
    return await this.prisma.book.findMany({
      where: {
        ...(title && {
          title: {
            contains: title,
          },
        }),
      },
      include: {
        author: true,
        category: true,
      },
    });
  }
}
