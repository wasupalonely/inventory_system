import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notifications.entity';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('supermarket/:supermarketId')
  async getNotificationsBySupermarketId(
    @Param('supermarketId') supermarketId: number,
  ): Promise<Notification[]> {
    return await this.notificationsService.findNotificationBySupermarketId(
      supermarketId,
    );
  }
}
