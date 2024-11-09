import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notifications.entity';
import { SupermarketModule } from 'src/supermarket/supermarket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), SupermarketModule],
  providers: [NotificationsService],
  controllers: [NotificationsController]
})
export class NotificationsModule {}
