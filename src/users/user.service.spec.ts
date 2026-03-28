import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import {
  makeCreateUserDto,
  makeUserEntity,
} from '../../test/factories/user-factory';
import { ConflictException } from '@nestjs/common';

describe('Users tests', () => {
  let userService: UsersService;
  let prismaService: PrismaService;
  let hashingService: HashingServiceProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: HashingServiceProtocol,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
  });

  it('should be defined users service', () => {
    expect(userService).toBeDefined();
  });

  describe('POST', () => {
    it('should create a new user', async () => {
      const createUserDto = makeCreateUserDto();
      const createdUserMocked = makeUserEntity({
        name: createUserDto.name,
        email: createUserDto.email,
      });

      jest
        .spyOn(hashingService, 'hash')
        .mockResolvedValue('PASSWORD_HASH_MOCK');
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(createdUserMocked);

      const response = await userService.createUser(createUserDto);

      expect(hashingService.hash).toHaveBeenCalled();
      expect(hashingService.hash).toHaveBeenCalledTimes(1);
      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          phone: createUserDto.phone,
          password: 'PASSWORD_HASH_MOCK',
        },
        select: {
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      });
      expect(response).toEqual(createdUserMocked);
    });

    it('should return ConflitException with user email already exists', async () => {
      const newUserDto = makeCreateUserDto({ email: 'judson@teste.com' });
      const existingUserInDb = makeUserEntity({ email: 'judson@teste.com' });

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(existingUserInDb);

      await expect(userService.createUser(newUserDto)).rejects.toThrow(
        ConflictException,
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: newUserDto.email },
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });
});
