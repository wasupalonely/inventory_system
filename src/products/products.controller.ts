import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

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
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  getProduct(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiResponse({ status: 201, type: Product })
  @ApiResponse({ status: 400, description: 'Mala petición' })
  createProduct(@Body() product: CreateProductDto) {
    return this.productsService.create(product);
  }

  //   @Get('category/:categoryId')
  //   @ApiResponse({ status: 200, type: [Product] })
  //   @ApiResponse({ status: 404, description: 'Category not found' })
  //   getProductsByCategory(@Param('categoryId') categoryId: number) {
  //     return this.productsService.findByCategoryId(categoryId);
  //   }
}
