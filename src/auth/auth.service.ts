import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
    const userEmailExists = await this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email,
      },
    });

    if (!userEmailExists) {
      throw new HttpException('Email não encontrado!', HttpStatus.NOT_FOUND);
    }

    const passwordIsValid = await this.hashingService.compare(
      loginUserDto.password,
      userEmailExists.password,
    );

    if (!passwordIsValid) {
      throw new HttpException('Senha inválida!', HttpStatus.UNAUTHORIZED);
    }

    const token = await this.jwtService.signAsync(
      {
        sub: userEmailExists.id,
        email: userEmailExists.email,
      },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.jwtTtl as any,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      },
    );

    return {
      message: `Usuário ${userEmailExists.name} logado com sucesso!, token: ${token}`,
    };
  }

  async SignOutUser() {}
}
