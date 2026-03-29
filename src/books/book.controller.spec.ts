import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateBookDto } from './dto/create-book.dto';

describe('BooksController', () => {
  let booksController: BooksController;

  const mockBooksService = {
    listAllBooks: jest.fn(),
    findOneBook: jest.fn(),
    findBooksByCategory: jest.fn(),
    findBooksByAuthor: jest.fn(),
    createNewBook: jest.fn(),
    deleteABook: jest.fn(),
  };

  beforeEach(async () => {
    const mockGuard = {
      canActivate: jest.fn(() => true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    booksController = module.get<BooksController>(BooksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(booksController).toBeDefined();
  });

  describe('GET /books', () => {
    it('should call the service and return a list of books', async () => {
      const paginationDto: PaginationDto = { limit: 10, offset: 0 };

      const expectedBooks = [
        { id: '1', title: 'Livro A', status: 'AVAILABLE' },
        { id: '2', title: 'Livro B', status: 'BORROWED' },
      ];

      mockBooksService.listAllBooks.mockResolvedValue(expectedBooks);

      const result = await booksController.listAllBooks(paginationDto);

      expect(mockBooksService.listAllBooks).toHaveBeenCalledWith(paginationDto);

      expect(result).toEqual(expectedBooks);
    });

    it('should return book by id', async () => {
      const expectBook = {
        id: '1',
        title: 'Rosinha e Jose',
        description: 'xxx',
        status: 'AVAILABLE',
      };

      mockBooksService.findOneBook.mockResolvedValue(expectBook.id);

      const result = await booksController.returnOneBook(expectBook.id);

      expect(mockBooksService.findOneBook).toHaveBeenCalled();
      expect(mockBooksService.findOneBook).toHaveBeenCalledWith(expectBook.id);
      expect(result).toEqual(expectBook.id);
    });

    it('should return books by category id', async () => {
      const paginationDto: PaginationDto = { limit: 10, offset: 0 };
      const categoryId = '103319';

      const expectBook = {
        id: '123',
        title: 'Rosinha e Jose',
        categoryId: categoryId,
        description: 'xxx',
        status: 'AVAILABLE',
      };

      mockBooksService.findBooksByCategory.mockResolvedValue(expectBook);

      const result = await booksController.listBooksByCategory(
        categoryId,
        paginationDto,
      );

      expect(mockBooksService.findBooksByCategory).toHaveBeenCalled();
      expect(mockBooksService.findBooksByCategory).toHaveBeenCalledWith(
        categoryId,
        paginationDto,
      );
      expect(result).toEqual(expectBook);
    });

    it('should return books by author id', async () => {
      const paginationDto: PaginationDto = { limit: 10, offset: 0 };
      const authorId = '103319';

      const expectBook = {
        id: '123',
        title: 'Rosinha e Jose',
        authorId: authorId,
        description: 'xxx',
        status: 'AVAILABLE',
      };

      mockBooksService.findBooksByAuthor.mockResolvedValue(expectBook);

      const result = await booksController.listBooksByAuthor(
        authorId,
        paginationDto,
      );

      expect(mockBooksService.findBooksByAuthor).toHaveBeenCalled();
      expect(mockBooksService.findBooksByAuthor).toHaveBeenCalledWith(
        authorId,
        paginationDto,
      );
      expect(result).toEqual(expectBook);
    });
  });

  describe('POST /books', () => {
    it('should create a new book', async () => {
      const category = {
        name: 'Ficção',
        id: '123-ABC',
      };

      const author = {
        name: 'Argus ciribelli',
        id: '456-EFG',
      };

      const book: CreateBookDto = {
        title: '',
        description: '',
        authorId: author.id,
        categoryId: category.id,
        pages: 200,
        year: 1998,
      };

      mockBooksService.createNewBook.mockResolvedValue(book);

      const result = await booksController.createBook(book);

      expect(mockBooksService.createNewBook).toHaveBeenCalled();
      expect(mockBooksService.createNewBook).toHaveBeenCalledWith(book);
      expect(result).toEqual(book);
    });
  });

  describe('DELETE /books', () => {
    it('should delete a book by id', async () => {
      const category = {
        name: 'Ficção',
        id: '123-ABC',
      };

      const author = {
        name: 'Argus ciribelli',
        id: '456-DEF',
      };

      const book = {
        id: '789-GHI',
        title: '',
        description: '',
        authorId: author.id,
        categoryId: category.id,
        pages: 200,
        year: 1998,
      };

      mockBooksService.deleteABook.mockResolvedValue(book.id);

      expect(mockBooksService.deleteABook).toHaveBeenCalled();
    });
  });
});
