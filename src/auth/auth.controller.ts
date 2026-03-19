import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { TransformInterceptor } from 'src/common/interceptor/transformer.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @UseInterceptors(TransformInterceptor)
  async signIn(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.SignInUser(loginUserDto);
  }
}
