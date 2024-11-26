import { Module } from '@nestjs/common';
import { CameraService } from './cameras.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Camera } from './entity/camera.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { CameraController } from './cameras.controller';
import { Category } from 'src/categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Camera, Supermarket, Category])],
  controllers: [CameraController],
  providers: [CameraService],
  exports: [CameraService],
})
export class CamerasModule {}
