import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supermarket } from '../supermarket/entities/supermarket.entity';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { Prediction } from './entities/prediction.entity/prediction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prediction, Supermarket])],
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
