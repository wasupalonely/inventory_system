import { forwardRef, Module } from '@nestjs/common';
import { SupermarketController } from './supermarket.controller';
import { SupermarketService } from './supermarket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supermarket } from './entities/supermarket.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from 'src/user/user.module';
import { Address } from './entities/address.entity';
import { HttpModule } from '@nestjs/axios';
import { PredictionsModule } from 'src/predictions/predictions.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supermarket, Address]),
    ScheduleModule.forRoot(),
    forwardRef(() => UserModule),
    HttpModule,
    PredictionsModule,
    NotificationsModule,
  ],
  controllers: [SupermarketController],
  providers: [SupermarketService],
  exports: [SupermarketService],
})
export class SupermarketModule {}
