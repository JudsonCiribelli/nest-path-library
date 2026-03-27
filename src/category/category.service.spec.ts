import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryService } from './category.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ConflictException } from '@nestjs/common';

describe('CATEGORY', () => {
  let categoryService: CategoryService;
  let prismaService: PrismaService;

  const prismaMock = {
    category: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Services should defined', () => {
    expect(categoryService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('POST', () => {
    it('should create a new category', async () => {
      const categoryOne: CreateCategoryDto = {
        name: 'Romance',
      };

      const normalizedName = categoryOne.name.trim().toLowerCase();
      const category: CreateCategoryDto = {
        name: normalizedName,
      };

      prismaMock.category.create.mockResolvedValue(category.name);

      const response = await categoryService.createCategory(category);

      expect(response).toEqual(category.name);
      expect(prismaMock.category.create).toHaveBeenCalled();
    });

    it('should return ConflictException when category name is already registered', async () => {
      const newCategoryDto = {
        name: 'Romance ',
      };

      const existingCategoryInDb = {
        id: 'cat-123',
        name: 'romance',
      };

      prismaMock.category.findUnique.mockResolvedValue(existingCategoryInDb);

      await expect(
        categoryService.createCategory(newCategoryDto),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
        where: { name: 'romance' },
      });

      expect(prismaMock.category.create).not.toHaveBeenCalled();
    });
  });
});
