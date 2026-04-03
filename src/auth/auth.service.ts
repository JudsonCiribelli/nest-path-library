import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import { HashingServiceProtocol } from './hash/hashing.service';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async SignInUser(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email,
        active: 'IN_USE',
      },
    });

    if (!user) {
      throw new HttpException('Credenciais inválidas', HttpStatus.BAD_REQUEST);
    }

    const passwordIsValid = await this.hashingService.compare(
      loginUserDto.password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Senha inválida!');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresIn: this.jwtConfiguration.jwtTtl as any,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
    });

    return {
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async SignOutUser() {}
}
