import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { CreatePredictionDto, UpdatePredictionDto } from './dto/prediction.dto';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,

    @InjectRepository(Supermarket)
    private supermarketRepository: Repository<Supermarket>,
  ) {}

  async getPredictionsBySupermarket(id: number): Promise<Prediction[]> {
    return this.predictionRepository.find({
      where: { supermarket: { id } },
    });
  }

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

  async update(
    id: number,
    updatePredictionDto: UpdatePredictionDto,
  ): Promise<Prediction> {
    const prediction = await this.predictionRepository.findOne({
      where: { id },
    });

    if (!prediction) {
      throw new NotFoundException('Prediction not found');
    }

    const updatedPrediction = this.predictionRepository.merge(
      prediction,
      updatePredictionDto,
    );
    return this.predictionRepository.save(updatedPrediction);
  }

  async getById(id: number): Promise<Prediction> {
    const prediction = this.predictionRepository.findOne({ where: { id } });

    if (!prediction) {
      throw new NotFoundException('Prediction not found');
    }

    return prediction;
  }
}
