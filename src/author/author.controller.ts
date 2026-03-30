import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna todos os autores cadastrados.' })
  async getAuthors() {
    return await this.authorService.getAuthors();
  }

  @Get(':authorId')
  @ApiOperation({ summary: 'Retorna os dados apenas um autor.' })
  async getAuthorById(@Param('authorId') authorId: string) {
    return this.authorService.getAuthorDetails(authorId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cria um novo autor.' })
  @UseGuards(AuthTokenGuard, RolesGuard)
  async createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
    return await this.authorService.registerAuthor(createAuthorDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deleta um autor cadastrado.' })
  @UseGuards(AuthTokenGuard, RolesGuard)
  async deleteAuthor(@Param() id: string) {
    return await this.authorService.deleteAuthor(id);
  }

  @Patch(':authorId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualiza os dados de um autor.' })
  @UseGuards(AuthTokenGuard, RolesGuard)
  async updateAuthor(
    @Param('authorId') authorId: string,
    @Body() updateAuthorDto: CreateAuthorDto,
  ) {
    return await this.authorService.updateAuthor(authorId, updateAuthorDto);
  }
}
