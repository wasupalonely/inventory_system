// src/supermarket/services/camera.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Camera } from './entity/camera.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { CreateCameraDto, UpdateCameraDto } from './dto/camera.dto';

@Injectable()
export class CameraService {
  constructor(
    @InjectRepository(Camera)
    private readonly cameraRepo: Repository<Camera>,
    @InjectRepository(Supermarket)
    private readonly supermarketRepo: Repository<Supermarket>,
  ) {}

  async create(createCameraDto: CreateCameraDto): Promise<Camera> {
    const supermarket = await this.supermarketRepo.findOne({
      where: { id: createCameraDto.supermarketId },
      relations: ['cameras'],
    });

    if (!supermarket) {
      throw new NotFoundException(
        `Supermercado con ID ${createCameraDto.supermarketId} no encontrado.`,
      );
    }

    if (supermarket.cameras.length >= 5) {
      throw new BadRequestException(
        `El supermercado con ID ${createCameraDto.supermarketId} ya tiene el máximo permitido de 5 cámaras.`,
      );
    }

    const newCamera = this.cameraRepo.create({
      ...createCameraDto,
      supermarket,
    });
    return this.cameraRepo.save(newCamera);
  }

  async findAll(): Promise<Camera[]> {
    return this.cameraRepo.find({ relations: ['supermarket'] });
  }

  async findBySupermarket(supermarketId: number): Promise<Camera[]> {
    return this.cameraRepo.find({
      where: { supermarket: { id: supermarketId } },
      relations: ['supermarket'],
    });
  }

  async findOne(id: number): Promise<Camera> {
    const camera = await this.cameraRepo.findOne({
      where: { id },
      relations: ['supermarket'],
    });

    if (!camera) {
      throw new NotFoundException(`Cámara con ID ${id} no encontrada.`);
    }

    return camera;
  }

  async update(id: number, updateCameraDto: UpdateCameraDto): Promise<Camera> {
    const camera = await this.findOne(id);
    Object.assign(camera, updateCameraDto);
    return this.cameraRepo.save(camera);
  }

  async remove(id: number): Promise<void> {
    const camera = await this.findOne(id);

    if (!camera) {
      throw new NotFoundException(`Cámara con ID ${id} no encontrada.`);
    }

    const supermarket = await this.supermarketRepo.findOne({
      where: { id: camera.supermarket.id },
      relations: ['cameras'],
    });

    if (!supermarket) {
      throw new NotFoundException(
        `Supermercado con ID ${camera.supermarket.id} no encontrado.`,
      );
    }

    await this.cameraRepo.delete({ id });

    supermarket.cameras = supermarket.cameras.filter((c) => c.id !== id);

    if (supermarket.cameras.length === 0) {
      await this.supermarketRepo.update(supermarket.id, {
        cronjobEnabled: false,
      });
    }
  }
}
