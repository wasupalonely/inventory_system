import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supermarket } from '../supermarket/entities/supermarket.entity';
import { PredictionEntity } from './entities/prediction.entity/prediction.entity';
import { PredictionsController } from './predictions/predictions.controller';
import { PredictionsService } from './predictions/predictions.service';


@Module({
  imports: [TypeOrmModule.forFeature([PredictionEntity, Supermarket])],
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
