// src/inventory/inventory.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Product } from 'src/products/entities/product.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Supermarket)
    private supermarketRepository: Repository<Supermarket>,
  ) {}

  async getInventoryByProductIdAndSupermarketId(
    productId: number,
    supermarketId: number,
  ): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        product: { id: productId },
        supermarket: { id: supermarketId },
      },
      relations: ['product', 'supermarket'],
    });

    if (!inventory) {
      throw new NotFoundException('Inventario no encontrado');
    }

    return inventory;
  }

  async addStock(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const product = await this.productRepository.findOne({
      where: { id: createInventoryDto.productId },
    });

    const supermarket = await this.supermarketRepository.findOne({
      where: { id: createInventoryDto.supermarketId },
    });

    if (!product || !supermarket) {
      throw new BadRequestException('Producto o supermercado no encontrado');
    }

    let inventory = await this.inventoryRepository.findOne({
      where: {
        product: { id: product.id },
        supermarket: { id: supermarket.id },
      },
    });

    if (!inventory) {
      inventory = this.inventoryRepository.create({
        product,
        supermarket,
        stock: createInventoryDto.stock,
      });
    } else {
      inventory.stock += createInventoryDto.stock;
    }

    return this.inventoryRepository.save(inventory);
  }

  async editStock(
    updateInventoryDto: UpdateInventoryDto,
    productId: number,
    supermarketId: number,
  ): Promise<Inventory> {
    const { stock } = updateInventoryDto;

    const inventory = await this.getInventoryByProductIdAndSupermarketId(
      productId,
      supermarketId,
    );

    inventory.stock = stock;

    return this.inventoryRepository.save(inventory);
  }

  async getInventoryBySupermarket(id: number): Promise<Inventory[]> {
    const inventory = await this.inventoryRepository.find({
      where: { supermarket: { id } },
      relations: ['product.category'],
    });

    if (!inventory) {
      throw new NotFoundException('Supermercado no encontrado');
    }

    return inventory;
  }

  async deleteInventory(
    productId: number,
    supermarketId: number,
  ): Promise<void> {
    const inventory = await this.getInventoryByProductIdAndSupermarketId(
      productId,
      supermarketId,
    );

    await this.inventoryRepository.remove(inventory);
  }
}
