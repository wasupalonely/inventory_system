import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supermarket } from '../supermarket/entities/supermarket.entity';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { Prediction } from './entities/prediction.entity';
import { CamerasModule } from 'src/cameras/cameras.module';

@Module({
  imports: [TypeOrmModule.forFeature([Prediction, Supermarket]), CamerasModule],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
