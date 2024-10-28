import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
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
    return await this.productRepo.find({
      relations: ['category'],
    });
  }

  async findBySupermarketId(supermarketId: number): Promise<Product[]> {
    const supermarket =
      await this.supermarketService.getSupermarket(supermarketId);

    if (!supermarket) {
      throw new NotFoundException(
        `Supermarket with ID ${supermarketId} not found`,
      );
    }

    return await this.productRepo.find({
      where: { supermarket: { id: supermarketId } },
      relations: ['category'],
    });
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
        `Category with ID ${product.categoryId} not found for supermarket ${product.supermarketId}`,
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

    const newProduct = this.productRepo.create({
      ...product,
      category,
      supermarket,
    });

    return await this.productRepo.save(newProduct);
  }

  async update(id: number, product: UpdateProductDto): Promise<Product> {
    // Verifica si el producto existe
    const existingProduct = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'supermarket'],
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (product.categoryId) {
      const category =
        await this.categoryService.getCategoryByIdAndSupermarketId(
          product.categoryId,
          existingProduct.supermarket.id,
        );
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${product.categoryId} not found for supermarket ${existingProduct.supermarket.id}`,
        );
      }
      existingProduct.category = category;
    }

    await this.productRepo.update(id, {
      ...product,
      supermarket: existingProduct.supermarket,
    });

    return await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'supermarket'],
    });
  }

  async delete(id: number): Promise<{ message: string }> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productRepo.delete(id);

    return {
      message: `Product with ID ${id} deleted successfully`,
    };
  }
}
