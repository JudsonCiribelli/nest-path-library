import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';

@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  async getAuthors() {
    const authors = await this.authorService.getAuthors();

    return authors;
  }

  @Post()
  async createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
    const author = await this.authorService.registerAuthor(createAuthorDto);
    return author;
  }

  @Delete(':id')
  async deleteAuthor(@Param() id: string) {
    const author = await this.authorService.deleteAuthor(id);

    return author;
  }
}
