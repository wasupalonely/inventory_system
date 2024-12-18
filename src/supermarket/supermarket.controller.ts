import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { SupermarketService } from './supermarket.service';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';
import {
  CreateSupermarketDto,
  UpdateSupermarketDto,
} from './dto/supermarket.dto';
import { Supermarket } from './entities/supermarket.entity';
import { ScheduleFrequency } from 'src/shared/enums/schedule-frequency';
import { ScheduleFrequencyDto } from './dto/schedule.dto';

@ApiTags('Supermarket')
@UseGuards(JwtAuthGuard)
@Controller('supermarket')
export class SupermarketController {
  constructor(private readonly supermarketService: SupermarketService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Viewer, Role.Owner)
  @Get()
  @ApiResponse({ status: 200, type: [Supermarket] })
  getSupermarkets() {
    return this.supermarketService.getSupermarkets();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Viewer, Role.Owner)
  @Get(':id')
  @ApiResponse({ status: 200, type: Supermarket })
  @ApiResponse({ status: 404, description: 'Supermercado no encontrado' })
  getSupermarket(@Param('id') id: number) {
    return this.supermarketService.getSupermarket(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Owner)
  @Post()
  @ApiResponse({ status: 201, type: Supermarket })
  @ApiResponse({ status: 400, description: 'El supermercado ya existe' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  createSupermarket(@Body() supermarket: CreateSupermarketDto) {
    return this.supermarketService.createSupermarket(supermarket);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Owner, Role.Admin)
  @Put(':id')
  @ApiResponse({ status: 200, type: Supermarket })
  @ApiResponse({ status: 404, description: 'Supermercado no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  updateSupermarket(
    @Param('id') id: number,
    @Body() supermarket: UpdateSupermarketDto,
  ) {
    return this.supermarketService.updateSupermarket(id, supermarket);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Owner)
  @Delete(':id')
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'Supermercado no encontrado' })
  deleteSupermarket(@Param('id') id: number) {
    return this.supermarketService.deleteSupermarket(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Owner, Role.Admin)
  @Patch(':supermarketId/enable-cron')
  async enableCronJob(
    @Param('supermarketId') supermarketId: number,
    @Body() dto: ScheduleFrequencyDto,
  ) {
    await this.supermarketService.updateCronStatus(
      supermarketId,
      true,
      dto.scheduleFrequency,
    );
    return { message: 'Cronjob habilitado' };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Owner)
  @Patch(':supermarketId/disable-cron')
  async disableCronJob(@Param('supermarketId') supermarketId: number) {
    await this.supermarketService.updateCronStatus(
      supermarketId,
      false,
      ScheduleFrequency.DAILY,
    );
    return { message: 'Cronjob deshabilitado' };
  }
}
