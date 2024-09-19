import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { Repository } from 'typeorm';
import { CreatePredictionDto } from '../dto/create-prediction.dto';
import { UpdatePredictionDto } from '../dto/update-prediction.dto/update-prediction.dto';
import { PredictionEntity } from './entities/prediction.entity/prediction.entity';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(PredictionEntity)
    private predictionRepository: Repository<PredictionEntity>,

    @InjectRepository(Supermarket)
    private supermarketRepository: Repository<Supermarket>,
  ) {}

  // Método para crear una predicción
  async create(createPredictionDto: CreatePredictionDto): Promise<PredictionEntity> {
    const supermarket = await this.supermarketRepository.findOne({ where: { id: createPredictionDto.supermarket_id } });

    if (!supermarket) {
      throw new Error('Supermarket not found');
    }

    const newPrediction = this.predictionRepository.create({
      ...createPredictionDto,
      supermarket,
    });

    return this.predictionRepository.save(newPrediction);
  }

  // Método para actualizar una predicción
  async update(id: number, updatePredictionDto: UpdatePredictionDto): Promise<PredictionEntity> {
    const prediction = await this.predictionRepository.findOne({ where: { id } });

    if (!prediction) {
      throw new Error('Prediction not found');
    }

    const updatedPrediction = this.predictionRepository.merge(prediction, updatePredictionDto);
    return this.predictionRepository.save(updatedPrediction);
  }
}
