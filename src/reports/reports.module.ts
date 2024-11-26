import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Sale } from 'src/sales/entities/sale.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupermarketModule } from 'src/supermarket/supermarket.module';
import { Prediction } from 'src/predictions/entities/prediction.entity';
import { Product } from 'src/products/entities/product.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Camera } from 'src/cameras/entity/camera.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, Prediction, Product, Inventory, Camera]),
    SupermarketModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
