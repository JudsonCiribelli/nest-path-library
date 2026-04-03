import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/interceptor/transformer.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('upload/:authorId')
  @UseGuards(AuthTokenGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        authorImage: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Usuário logado (ADMIN) podem cadastrar a imagem de para um autor.',
  })
  @UseInterceptors(TransformInterceptor)
  @UseInterceptors(FileInterceptor('authorImage'))
  async uploadAuthorImage(
    @Param('authorId') authorId: string,
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
    authorImage: Express.Multer.File,
  ) {
    return this.authorService.uploadAuthorImage(authorImage, authorId);
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
