import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
      },
    });

    console.log(category);
    if (category) return category;

    throw new HttpException('Está categoria já foi cadastrada!', 500);
  }

  async findAllCategory() {
    const categories = await this.prisma.category.findMany({});

    if (categories) return categories;

    throw new HttpException(
      'Não há categorias cadastradas!',
      HttpStatus.NOT_FOUND,
    );
  }
}
