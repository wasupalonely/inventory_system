import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Product, Inventory])],
  providers: [SalesService],
  controllers: [SalesController],
})
export class SalesModule {}
