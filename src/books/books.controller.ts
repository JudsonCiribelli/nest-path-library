import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LoggerInterceptor } from 'src/common/interceptor/logger.interceptor';
import { TransformInterceptor } from 'src/common/interceptor/transformer.interceptor';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @UseInterceptors(LoggerInterceptor)
  @UseInterceptors(TransformInterceptor)
  async listAllBooks(@Query() paginationDto: PaginationDto) {
    return this.booksService.listAllBooks(paginationDto);
  }

  @Get(':bookId')
  async returnOneBook(@Param('bookId') bookId: string) {
    return this.booksService.findOneBook(bookId);
  }

  @Get('/category/:categoryId')
  async listBooksByCategory(
    @Param('categoryId') categoryId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.booksService.findBooksByCategory(categoryId, paginationDto);
  }

  @Get('/author/:authorId')
  async listBooksByAuthor(
    @Param('authorId') authorId: string,
    @Query() PaginationDto: PaginationDto,
  ) {
    return this.booksService.findBooksByAuthor(authorId, PaginationDto);
  }

  @Post()
  @UseGuards(AuthTokenGuard)
  async createBook(
    @Body() createBookDto: CreateBookDto,
    @GetUser('sub') userId: string,
  ) {
    return this.booksService.createNewBook(createBookDto, userId);
  }

  @Delete('/book/:bookId')
  @UseGuards(AuthTokenGuard)
  async deleteBook(
    @Param('bookId') bookId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.booksService.deleteABook(bookId, userId);
  }
}
