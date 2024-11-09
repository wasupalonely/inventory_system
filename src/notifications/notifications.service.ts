import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notifications.entity';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private mailService: MailService,
  ) {}

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find();
  }

  async findNotificationById(id: number): Promise<Notification> {
    return await this.notificationRepository.findOne({ where: { id } });
  }

  async createNotification(
    notification: CreateNotificationDto,
    mail?: { to: string; subject: string; text?: string; html?: string },
  ): Promise<Notification> {

    if (mail) {
      await this.mailService.sendMail(
        mail.to,
        mail.subject,
        mail.text,
        mail.html,
      );
    }

    return await this.notificationRepository.save(notification);
  }

  async findNotificationBySupermarketId(
    supermarketId: number,
  ): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { supermarket: { id: supermarketId } },
    });
  }
}
