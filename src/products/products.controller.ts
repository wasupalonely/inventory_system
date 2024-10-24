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
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/product.dto';

@ApiTags('Products')
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiResponse({ status: 200, type: [Product] })
  getProducts() {
    return this.productsService.findAll();
  }

  @Get('supermarket/:supermarketId')
  @ApiResponse({ status: 200, type: [Product] })
  getProductsBySupermarket(@Param('supermarketId') supermarketId: number) {
    return this.productsService.findBySupermarketId(supermarketId);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getProduct(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiResponse({ status: 201, type: Product })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createProduct(@Body() product: CreateProductDto) {
    return this.productsService.create(product);
  }

  @Put(':id')
  @ApiResponse({ status: 200, type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  updateProduct(@Param('id') id: number, @Body() product: CreateProductDto) {
    return this.productsService.update(id, product);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    type: Object,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  deleteProduct(@Param('id') id: number): Promise<{ message: string }> {
    return this.productsService.delete(id);
  }

  //   @Get('category/:categoryId')
  //   @ApiResponse({ status: 200, type: [Product] })
  //   @ApiResponse({ status: 404, description: 'Category not found' })
  //   getProductsByCategory(@Param('categoryId') categoryId: number) {
  //     return this.productsService.findByCategoryId(categoryId);
  //   }
}
