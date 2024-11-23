import { Module } from '@nestjs/common';
import { CameraService } from './cameras.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Camera } from './entity/camera.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { CameraController } from './cameras.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Camera, Supermarket])],
  controllers: [CameraController],
  providers: [CameraService],
  exports: [CameraService],
})
export class CamerasModule {}
