// src/supermarket/controllers/camera.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CameraService } from './cameras.service';
import { CreateCameraDto, UpdateCameraDto } from './dto/camera.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';

@ApiTags('Cameras')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cameras')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  @Roles(Role.Admin, Role.Owner)
  @Post()
  async create(@Body() createCameraDto: CreateCameraDto) {
    return this.cameraService.create(createCameraDto);
  }

  @Get()
  async findAll() {
    return this.cameraService.findAll();
  }

  @Roles(Role.Admin, Role.Owner, Role.Viewer)
  @Get('supermarket/:supermarketId')
  async findBySupermarket(@Param('supermarketId') supermarketId: number) {
    return this.cameraService.findBySupermarket(supermarketId);
  }

  @Roles(Role.Admin, Role.Owner, Role.Viewer)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.cameraService.findOne(id);
  }

  @Roles(Role.Admin, Role.Owner)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCameraDto: UpdateCameraDto,
  ) {
    return this.cameraService.update(id, updateCameraDto);
  }

  @Roles(Role.Admin, Role.Owner)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.cameraService.remove(id);
  }
}
