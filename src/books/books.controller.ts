import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  listAllBooks(@Query() paginationDto: PaginationDto) {
    return this.booksService.listAllBooks(paginationDto);
  }

  @Get(':id')
  returnOneBook(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return this.booksService.findOneBook(id);
  }

  @Post()
  createBook(@Body() createBookDto: CreateBookDto) {
    return this.booksService.createNewBook(createBookDto);
  }

  @Patch(':id')
  updateBook(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.booksService.updateABook(id, body);
  }

  @Delete(':id')
  deleteBook(@Param('id') id: string) {
    return this.booksService.deleteABook(id);
  }
}
