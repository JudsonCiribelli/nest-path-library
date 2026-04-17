/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { REQUEST_TOKEN_PAYLOAD } from '../common/auth.constants';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não encontrado!');
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      request[REQUEST_TOKEN_PAYLOAD] = payload;

      const userStatus = await this.prisma.user.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          id: payload?.sub,
        },
      });

      if (userStatus?.active !== 'IN_USE') {
        throw new UnauthorizedException(
          'Conta desativada, entre em contato com o suporte!',
        );
      }

      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Acesso não autorizado!');
    }
  }

  extractTokenFromHeader(request: Request) {
    const authHeader = request.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }

    return authHeader.split(' ')[1];
  }
}
