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
import { AuthAdminGuard } from 'src/common/guards/admin.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';

@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  async getAuthors() {
    return await this.authorService.getAuthors();
  }

  @Get(':authorId')
  @UseGuards(AuthTokenGuard)
  async getAuthorById(@Param('authorId') authorId: string) {
    return this.authorService.getAuthorDetails(authorId);
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(AuthTokenGuard, RolesGuard)
  async createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
    return await this.authorService.registerAuthor(createAuthorDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(AuthTokenGuard, RolesGuard)
  async deleteAuthor(@Param() id: string) {
    return await this.authorService.deleteAuthor(id);
  }

  @Patch(':authorId')
  @Roles('ADMIN')
  @UseGuards(AuthTokenGuard, RolesGuard)
  async updateAuthor(
    @Param('authorId') authorId: string,
    @Body() updateAuthorDto: CreateAuthorDto,
  ) {
    return await this.authorService.updateAuthor(authorId, updateAuthorDto);
  }
}
