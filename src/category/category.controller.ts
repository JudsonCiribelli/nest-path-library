import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryService } from './category.service';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';

@Controller('category')
@UseGuards(AuthAdminGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  async findAllCategory() {
    const categories = await this.categoryService.findAllCategory();

    return categories;
  }

  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const category =
      await this.categoryService.createCategory(createCategoryDto);

    return category;
  }
}
