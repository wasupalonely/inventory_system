// src/supermarket/services/camera.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Camera } from './entity/camera.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CreateCameraDto, UpdateCameraDto } from './dto/camera.dto';

@Injectable()
export class CameraService {
  constructor(
    @InjectRepository(Camera)
    private readonly cameraRepo: Repository<Camera>,
    @InjectRepository(Supermarket)
    private readonly supermarketRepo: Repository<Supermarket>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(createCameraDto: CreateCameraDto): Promise<Camera> {
    // Validar que el supermercado exista
    const supermarket = await this.supermarketRepo.findOne({
      where: { id: createCameraDto.supermarketId },
      relations: ['cameras'],
    });
    if (!supermarket) {
      throw new NotFoundException(
        `Supermercado con ID ${createCameraDto.supermarketId} no encontrado.`,
      );
    }

    // Validar que la categoría (corte de carne) exista
    const category = await this.categoryRepo.findOne({
      where: { id: createCameraDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${createCameraDto.categoryId} no encontrada.`,
      );
    }

    // Crear la nueva cámara
    const newCamera = this.cameraRepo.create({
      name: createCameraDto.name,
      description: createCameraDto.description,
      supermarket,
      category,
    });

    return this.cameraRepo.save(newCamera);
  }

  async update(id: number, updateCameraDto: UpdateCameraDto): Promise<Camera> {
    // Validar que la cámara exista
    const camera = await this.cameraRepo.findOne({
      where: { id },
      relations: ['supermarket', 'category'],
    });
    if (!camera) {
      throw new NotFoundException(`Cámara con ID ${id} no encontrada.`);
    }

    // Validar que la categoría exista si se proporciona
    if (updateCameraDto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: updateCameraDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Categoría con ID ${updateCameraDto.categoryId} no encontrada.`,
        );
      }
      camera.category = category;
    }

    // Actualizar datos de la cámara
    Object.assign(camera, updateCameraDto);
    return this.cameraRepo.save(camera);
  }

  async findAll(): Promise<Camera[]> {
    return this.cameraRepo.find({
      relations: ['supermarket', 'category'],
    });
  }

  async findBySupermarket(supermarketId: number): Promise<Camera[]> {
    return this.cameraRepo.find({
      where: { supermarket: { id: supermarketId } },
      relations: ['supermarket', 'category'],
    });
  }

  async findOne(id: number): Promise<Camera> {
    const camera = await this.cameraRepo.findOne({
      where: { id },
      relations: ['supermarket', 'category'],
    });
    if (!camera) {
      throw new NotFoundException(`Cámara con ID ${id} no encontrada.`);
    }
    return camera;
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
