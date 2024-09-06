import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Supermarket } from './entities/supermarket.entity';
import { Repository } from 'typeorm';
import { CreateSupermarketDto } from './dto/supermarket.dto';

@Injectable()
export class SupermarketService {
  constructor(
    @InjectRepository(Supermarket)
    private supermarketRepo: Repository<Supermarket>,
  ) {}

  async getSupermarkets(): Promise<Supermarket[]> {
    return await this.supermarketRepo.find();
  }

  async getSupermarket(id: number): Promise<Supermarket> {
    const supermarket = await this.supermarketRepo.findOne({ where: { id } });
    if (!supermarket) {
      throw new NotFoundException(`Supermarket with ID ${id} not found`);
    }
    return supermarket;
  }

  async createSupermarket(
    supermarket: CreateSupermarketDto,
  ): Promise<Supermarket> {
    return await this.supermarketRepo.save(supermarket);
  }
}
