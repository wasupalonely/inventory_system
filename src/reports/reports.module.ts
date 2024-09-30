import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Sale } from 'src/sales/entities/sale.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupermarketModule } from 'src/supermarket/supermarket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sale]), SupermarketModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
