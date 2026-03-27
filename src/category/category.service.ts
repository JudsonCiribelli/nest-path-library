import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const normalizedName = createCategoryDto.name.trim().toLowerCase();

    const category = await this.prisma.category.findUnique({
      where: {
        name: normalizedName,
      },
    });

    if (category) {
      throw new ConflictException('Esta categoria já está cadastrada.');
    }

    try {
      return await this.prisma.category.create({
        data: {
          name: normalizedName,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Erro ao salvar a categoria.');
    }
  }

  async findAllCategory() {
    return await this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
