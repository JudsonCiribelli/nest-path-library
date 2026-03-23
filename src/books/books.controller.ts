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
  listAllBooks(@Query() paginationDto: PaginationDto) {
    return this.booksService.listAllBooks(paginationDto);
  }

  @Get(':id')
  returnOneBook(@Param('id') id: string) {
    return this.booksService.findOneBook(id);
  }

  @Post()
  @UseGuards(AuthTokenGuard)
  createBook(
    @Body() createBookDto: CreateBookDto,
    @GetUser('sub') userId: string,
  ) {
    return this.booksService.createNewBook(createBookDto, userId);
  }

  @Delete(':id')
  deleteBook(@Param('id') id: string) {
    return this.booksService.deleteABook(id);
  }
}
