import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { Repository } from 'typeorm';
import { CreatePredictionDto, UpdatePredictionDto } from './dto/prediction.dto';
import { Prediction } from './entities/prediction.entity/prediction.entity';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,

    @InjectRepository(Supermarket)
    private supermarketRepository: Repository<Supermarket>,
  ) {}

  // Método para crear una predicción
  async create(createPredictionDto: CreatePredictionDto): Promise<Prediction> {
    const supermarket = await this.supermarketRepository.findOne({
      where: { id: createPredictionDto.supermarketId },
    });

    if (!supermarket) {
      throw new NotFoundException('Supermercado no encontrado');
    }

    const newPrediction = this.predictionRepository.create({
      ...createPredictionDto,
      supermarket,
    });

    return this.predictionRepository.save(newPrediction);
  }

  // Método para actualizar una predicción
  async update(
    id: number,
    updatePredictionDto: UpdatePredictionDto,
  ): Promise<Prediction> {
    const prediction = await this.predictionRepository.findOne({
      where: { id },
    });

    if (!prediction) {
      throw new NotFoundException('Pronóstico no encontrado');
    }

    const updatedPrediction = this.predictionRepository.merge(
      prediction,
      updatePredictionDto,
    );
    return this.predictionRepository.save(updatedPrediction);
  }
}
