import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryService } from './category.service';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Busca todas as categorias.' })
  @Get()
  async findAllCategory() {
    return await this.categoryService.findAllCategory();
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cadastra uma nova categoria.' })
  @UseGuards(AuthAdminGuard, RolesGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.createCategory(createCategoryDto);
  }
}
