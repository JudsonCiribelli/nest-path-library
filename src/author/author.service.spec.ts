import { PrismaService } from 'src/prisma/prisma.service';
import { AuthorService } from './author.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuthorDto } from './dto/create-author.dto';
import { faker } from '@faker-js/faker';
import { ConflictException } from '@nestjs/common';

describe('AUTHOR', () => {
  let authorService: AuthorService;
  let prismaService: PrismaService;

  const prismaMock = {
    author: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    authorService = module.get<AuthorService>(AuthorService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Services should be defined', () => {
    expect(authorService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('POST', () => {
    it('should create a new author', async () => {
      const authorBirthDate = {
        birthDate: '28-07-2000',
      };

      const author: CreateAuthorDto = {
        name: 'judson',
        bio: 'xxxxxxxx',
        birthDate: new Date(authorBirthDate.birthDate),
      };

      prismaMock.author.create.mockResolvedValue(author);

      const response = await authorService.registerAuthor(author);

      expect(response).toEqual(author);
      expect(prismaMock.author.create).toHaveBeenCalled();
    });

    it('should return ConflicException with author already register', async () => {
      const newAuthor = {
        name: 'Argus',
        bio: 'BBBBBBBB',
        birthDate: new Date('28.07.2000'),
      };

      const authorAlreadyRegister = {
        name: 'argus',
        bio: 'xxxxxxx',
        birthDate: new Date('08.10.1999'),
      };

      prismaMock.author.findFirst.mockResolvedValue(authorAlreadyRegister);
      await expect(authorService.registerAuthor(newAuthor)).rejects.toThrow(
        ConflictException,
      );

      expect(prismaMock.author.findFirst).toHaveBeenCalledWith({
        where: { name: 'argus' },
      });
      expect(prismaMock.author.create).not.toHaveBeenCalled();
    });
  });
});
