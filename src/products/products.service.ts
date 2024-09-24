import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/product.dto';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private readonly supermarketService: SupermarketService,
    private readonly categoryService: CategoriesService,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.productRepo.find();
  }

  async findBySupermarketId(supermarketId: number): Promise<Product[]> {
    const supermarket =
      await this.supermarketService.getSupermarket(supermarketId);

    if (!supermarket) {
      throw new NotFoundException(
        `Supermarket with ID ${supermarketId} not found`,
      );
    }

    return await this.productRepo.find({ where: { supermarket } });
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepo.findOne({ where: { id } });
  }

  async create(product: CreateProductDto): Promise<Product> {
    const category = await this.categoryService.findOne(product.categoryId);

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${product.categoryId} not found`,
      );
    }

    const supermarket = await this.supermarketService.getSupermarket(
      product.supermarketId,
    );

    if (!supermarket) {
      throw new NotFoundException(
        `Supermarket with ID ${product.supermarketId} not found`,
      );
    }

    return await this.productRepo.save(product);
  }
}
