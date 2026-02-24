import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Books } from './entities/books.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}
  private Books: Books[] = [
    {
      id: 1,
      title: 'O Eco do Silêncio',
      author: 'ARGUS CIRIBELLI',
      description: '',
      pages: 342,
      year: 2024,
    },
  ];

  async listAllBooks(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const allBooks = await this.prisma.book.findMany({
      take: limit,
      skip: offset,
    });

    return allBooks;
  }

  findOneBook(id: number) {
    const bookExist = this.Books.find((book) => book.id === id);

    if (bookExist) return bookExist;

    throw new HttpException('Livro não encontrado!', HttpStatus.NOT_FOUND);
  }

  async createNewBook(createBookDto: CreateBookDto) {
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

  updateABook(id: number, body: any) {
    const bookExist = this.Books.findIndex((book) => book.id === id);

    if (bookExist >= 0) {
      const book = this.Books[bookExist];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.Books[bookExist] = {
        ...book,
        ...body,
      };
    }
    console.log(this.Books);

    return 'Livro atualizado com sucesso!';
  }

  deleteABook(id: string) {
    const bookExist = this.Books.findIndex((book) => book.id === Number(id));

    if (bookExist >= 0) {
      this.Books.splice(bookExist, 1);
    }

    console.log(this.Books);
    return 'Livro deletado com sucesso!';
  }
}
