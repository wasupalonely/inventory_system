import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notifications.entity';
import { MailModule } from 'src/mail/mail.module';
import { NotificationsController } from './notifications.controller';
import { SupermarketModule } from 'src/supermarket/supermarket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    MailModule,
    forwardRef(() => SupermarketModule),
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
