import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Product, Supermarket])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
