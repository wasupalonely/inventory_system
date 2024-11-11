import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Sale } from 'src/sales/entities/sale.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupermarketModule } from 'src/supermarket/supermarket.module';
import { Prediction } from 'src/predictions/entities/prediction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Prediction]), SupermarketModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
