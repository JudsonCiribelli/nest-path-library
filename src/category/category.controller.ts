import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryService } from './category.service';
import { AuthAdminGuard } from '@/common/guards/admin.guard';
import { Roles } from '@/common/decorator/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Busca todas as categorias.' })
  @Get()
  async findAllCategory() {
    return await this.categoryService.findAllCategory();
  }

  @ApiOperation({ summary: 'Busca categoria pelo seu id.' })
  @Get(':categoryId')
  async findCategoryById(@Param('categoryId') categoryId: string) {
    return await this.categoryService.getCategoryById(categoryId);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cadastra uma nova categoria.' })
  @UseGuards(AuthAdminGuard, RolesGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.createCategory(createCategoryDto);
  }
}
