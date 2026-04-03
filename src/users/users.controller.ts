import 'multer';
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { TransformInterceptor } from 'src/common/interceptor/transformer.interceptor';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { tokenPayloadParam } from 'src/auth/param/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca os dados do usuário logado.' })
  @Get('profile')
  async getUserProfile(@GetUser('sub') userId: string) {
    console.log('ID vindo do Token:', userId);
    return this.usersService.getUserProfile(userId);
  }

  @ApiOperation({ summary: 'Cria um novo usuário.' })
  @Post()
  @UseInterceptors(TransformInterceptor)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('upload')
  @UseGuards(AuthTokenGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageProfile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Usuário logado pode cadastrar uma imagem de perfil.',
  })
  @UseInterceptors(TransformInterceptor)
  @UseInterceptors(FileInterceptor('imageProfile'))
  async imageProfile(
    @tokenPayloadParam() tokenPayload: TokenPayloadDto,
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
    imageProfile: Express.Multer.File,
  ) {
    return this.usersService.uploadUserImage(tokenPayload, imageProfile);
  }

  @Delete('/upload')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Usuário logado pode deletar sua imagem de perfil.',
  })
  @ApiBearerAuth()
  @UseInterceptors(TransformInterceptor)
  async deleteUserImage(@tokenPayloadParam() tokenPayload: TokenPayloadDto) {
    return this.usersService.deleteUserImage(tokenPayload);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Deleta um usuário.',
  })
  @ApiBearerAuth()
  async deleteUser(
    @Param('id') id: string,
    @tokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.usersService.deleteUser(id, tokenPayload);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Atualiza os dados do usuário logado.',
  })
  @ApiBearerAuth()
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @tokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    console.log(tokenPayload);
    return this.usersService.updateUser(id, updateUserDto, tokenPayload);
  }
}
