import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  async getAuthors() {
    return await this.authorService.getAuthors();
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(AuthAdminGuard, RolesGuard)
  async createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
    return await this.authorService.registerAuthor(createAuthorDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(AuthAdminGuard, RolesGuard)
  async deleteAuthor(@Param() id: string) {
    return await this.authorService.deleteAuthor(id);
  }
}
