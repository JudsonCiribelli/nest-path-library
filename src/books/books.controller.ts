import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LoggerInterceptor } from 'src/common/interceptor/logger.interceptor';
import { TransformInterceptor } from 'src/common/interceptor/transformer.interceptor';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @UseInterceptors(LoggerInterceptor)
  @ApiOperation({ summary: 'Lista todos os livros.' })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Limite de livros buscados.',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0,
    description: 'Itens que deseja pular.',
  })
  @UseInterceptors(TransformInterceptor)
  async listAllBooks(@Query() paginationDto: PaginationDto) {
    return this.booksService.listAllBooks(paginationDto);
  }

  @ApiOperation({ summary: 'Retorna de apenas um livro.' })
  @Get(':bookId')
  async returnOneBook(@Param('bookId') bookId: string) {
    return this.booksService.findOneBook(bookId);
  }

  @ApiOperation({
    summary: 'Lista todos os livros de uma determinada categoria.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Limite de livros buscados.',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0,
    description: 'Itens que deseja pular.',
  })
  @Get('/category/:categoryId')
  async listBooksByCategory(
    @Param('categoryId') categoryId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.booksService.findBooksByCategory(categoryId, paginationDto);
  }

  @ApiOperation({
    summary: 'Lista todos os livros de um determinado autor.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Limite de livros buscados.',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0,
    description: 'Itens que deseja pular.',
  })
  @Get('/author/:authorId')
  async listBooksByAuthor(
    @Param('authorId') authorId: string,
    @Query() PaginationDto: PaginationDto,
  ) {
    return this.booksService.findBooksByAuthor(authorId, PaginationDto);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Cria um novo livro.',
  })
  @UseGuards(AuthTokenGuard, RolesGuard)
  async createBook(@Body() createBookDto: CreateBookDto) {
    return this.booksService.createNewBook(createBookDto);
  }

  @Post('upload/:bookId')
  @UseGuards(AuthTokenGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bookImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Usuário logado (ADMIN) podem cadastrar a imagem de para um livro.',
  })
  @UseInterceptors(TransformInterceptor)
  @UseInterceptors(FileInterceptor('bookImage'))
  async uploadBookImage(
    @Param('bookId') bookId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpeg|jpg|png/g,
        })
        .addMaxSizeValidator({
          maxSize: 10 * (1024 * 1024),
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    bookImage: Express.Multer.File,
  ) {
    return this.booksService.uploadBookImage(bookImage, bookId);
  }

  @Delete('/book/:bookId')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Deleta um autor já cadastrado.',
  })
  @UseGuards(AuthTokenGuard, RolesGuard)
  async deleteBook(@Param('bookId') bookId: string) {
    return this.booksService.deleteABook(bookId);
  }
}
