import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { TransformInterceptor } from '@/common/interceptor/transformer.interceptor';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Login do usuário.' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @UseInterceptors(TransformInterceptor)
  async signIn(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.SignInUser(loginUserDto);
  }
}
