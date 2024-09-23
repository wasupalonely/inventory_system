import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/category.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Role } from 'src/shared/enums/roles.enum';
import { Roles } from 'src/shared/decorators/roles.decorators';

@ApiTags('Categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiResponse({ status: 200, type: [Category] })
  getCategories() {
    return this.categoriesService.findAll();
  }

  @Get('supermarket/:supermarketId')
  @ApiResponse({ status: 200, type: [Category] })
  getCategoriesBySupermarket(@Param('supermarketId') supermarketId: number) {
    return this.categoriesService.getCategoriesBySupermarket(supermarketId);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: Category })
  getCategory(@Param('id') id: number) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @Roles(Role.Admin)
  @ApiResponse({ status: 201, type: Category })
  @ApiResponse({ status: 400, description: 'Category already exists' })
  createCategory(@Body() category: CreateCategoryDto) {
    return this.categoriesService.create(category);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @ApiResponse({ status: 200, type: Category })
  @ApiResponse({ status: 404, description: 'Category not found' })
  updateCategory(@Param('id') id: number, @Body() category: CreateCategoryDto) {
    return this.categoriesService.update(id, category);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'Category not found' })
  deleteCategory(@Param('id') id: number) {
    return this.categoriesService.delete(id);
  }
}
