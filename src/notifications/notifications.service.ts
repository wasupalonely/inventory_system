import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notifications.entity';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private supermarketService: SupermarketService
  ) {}

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find();
  }

  async findNotificationById(id: number): Promise<Notification> {
    return await this.notificationRepository.findOne({ where: { id } });
  }

  async createNotification(notification: CreateNotificationDto): Promise<Notification> {
    await this.supermarketService.getSupermarket(notification.supermarketId);
    return await this.notificationRepository.save(notification);
  }

  async findNotificationBySupermarketId(supermarketId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({ where: { supermarket: { id: supermarketId } } });
  }
}
