import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/product.dto';
import { Product } from './entities/product.entity';

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
        `Supermercado con ID ${supermarketId} no encontrado`,
      );
    }

    return await this.productRepo.find({ where: { supermarket } });
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepo.findOne({ where: { id } });
  }

  async create(product: CreateProductDto): Promise<Product> {
    const category = await this.categoryService.getCategoryByIdAndSupermarketId(
      product.categoryId,
      product.supermarketId,
    );

    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${product.categoryId} no encontrada para supermercado ${product.supermarketId}`,
      );
    }

    const supermarket = await this.supermarketService.getSupermarket(
      product.supermarketId,
    );

    if (!supermarket) {
      throw new NotFoundException(
        `Supermercado con ID ${product.supermarketId} no encontrado`,
      );
    }

    const newProduct = this.productRepo.create({
      ...product,
      category,
      supermarket,
    });

    return await this.productRepo.save(newProduct);
  }
}
