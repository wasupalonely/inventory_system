import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Role } from 'src/shared/enums/roles.enum';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Products')
@UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseInterceptors(FileInterceptor('image', { dest: '../uploads' }))
  @Roles(Role.Admin, Role.Owner, Role.Cashier)
  @ApiResponse({ status: 201, type: Product })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createProduct(
    @Body() product: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.productsService.create(product, image);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  @Roles(Role.Admin, Role.Owner, Role.Cashier)
  @ApiResponse({ status: 200, type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  updateProduct(
    @Param('id') id: number,
    @Body() product: UpdateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.productsService.update(id, product, image);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Owner)
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
