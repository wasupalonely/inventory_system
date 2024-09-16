import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { SupermarketModule } from 'src/supermarket/supermarket.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), SupermarketModule, CategoriesModule],
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class ProductsModule {}
