import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryService } from './category.service';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('category')
@UseGuards(AuthAdminGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  async findAllCategory() {
    return await this.categoryService.findAllCategory();
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(AuthAdminGuard, RolesGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.createCategory(createCategoryDto);
  }
}
