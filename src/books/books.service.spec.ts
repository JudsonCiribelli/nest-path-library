import { PrismaService } from 'src/prisma/prisma.service';
import { BooksService } from './books.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateBookDto } from './dto/create-book.dto';
import { ConflictException } from '@nestjs/common';

describe('BOOK', () => {
  let booksService: BooksService;
  let prismaService: PrismaService;

  const prismaMock = {
    book: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    booksService = module.get<BooksService>(BooksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('Services should defined', () => {
    expect(booksService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  it('should create a book with status AVAILABLE', async () => {
    const author = {
      id: '123-ABC',
    };
    const category = {
      id: '456-DEF',
    };

    const book: CreateBookDto = {
      title: 'Removedor de alma',
      authorId: author.id,
      description: 'lorem',
      categoryId: category.id,
      pages: 200,
      year: 2000,
    };

    const expectedSavedBook = {
      id: 'book-789',
      ...book,
      status: 'AVAILABLE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.book.create.mockResolvedValue(expectedSavedBook);

    const response = await booksService.createNewBook(book);

    expect(response).toEqual(expectedSavedBook);
    expect(response.status).toBe('AVAILABLE');
    expect(prismaMock.book.create).toHaveBeenCalledWith({
      data: book,
    });
  });
  it('should prevent deletion of a book that is currently BORROWED', async () => {
    const bookId = 'book-123';

    const borrowedBookInDb = {
      id: bookId,
      title: 'Código Limpo',
      status: 'BORROWED',
    };

    prismaMock.book.findUnique.mockResolvedValue(borrowedBookInDb);

    await expect(booksService.deleteABook(bookId)).rejects.toThrow(
      ConflictException,
    );
    expect(prismaMock.book.findUnique).toHaveBeenCalledWith({
      where: { id: bookId },
    });

    expect(prismaMock.book.delete).not.toHaveBeenCalled();
  });
});
