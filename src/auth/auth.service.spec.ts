import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import jwtConfig from './config/jwt.config';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import { makeUserEntity } from '../../test/factories/user-factory';

describe('AUTH', () => {
  let prismaService: PrismaService;
  let authService: AuthService;
  let hashingService: HashingServiceProtocol;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: { user: { findUnique: jest.fn() } },
        },
        {
          provide: HashingServiceProtocol,
          useValue: { compare: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            secret: 'test-secret',
            audience: 'test-audience',
            issuer: 'test-issuer',
            jwtTtl: 3600,
          },
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SignInUser (Login)', () => {
    const loginDto = {
      email: 'judson@teste.com',
      password: 'senhaSuperSecreta',
    };

    const mockUserInDb = {
      id: 'user-123',
      name: 'Judson',
      email: 'judson@teste.com',
      password: 'senha_hasheada_do_banco',
      role: 'USER',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const createdUserMocked = makeUserEntity({
      name: mockUserInDb.name,
      email: mockUserInDb.email,
    });

    it('should be defined service', () => {
      expect(prismaService).toBeDefined();
      expect(authService).toBeDefined();
      expect(hashingService).toBeDefined();
      expect(jwtService).toBeDefined();
    });

    it('should return HttpException if email does not exist', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(authService.SignInUser(loginDto)).rejects.toThrow(
        HttpException,
      );

      expect(hashingService.compare).not.toHaveBeenCalled();
    });

    it('should return UnauthorizedException if the password is wrong', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(createdUserMocked);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(false);

      await expect(authService.SignInUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('It must successfully generate and return the JWT token', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(createdUserMocked);

      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);

      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('token_jwt_falso_mas_valido');

      const result = await authService.SignInUser(loginDto);

      expect(result).toEqual({
        token: 'token_jwt_falso_mas_valido',
        user: {
          name: mockUserInDb.name,
          email: mockUserInDb.email,
          role: mockUserInDb.role,
        },
      });
    });
  });
});
