import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notifications.entity';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(Role.Admin, Role.Owner)
  @Get('supermarket/:supermarketId')
  async getNotificationsBySupermarketId(
    @Param('supermarketId') supermarketId: number,
  ): Promise<Notification[]> {
    return await this.notificationsService.findNotificationBySupermarketId(
      supermarketId,
    );
  }
}
