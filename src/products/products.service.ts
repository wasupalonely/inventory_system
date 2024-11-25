import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import { CategoriesService } from 'src/categories/categories.service';
import { UploadService } from 'src/upload/upload.service';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private readonly supermarketService: SupermarketService,
    private readonly categoryService: CategoriesService,
    private readonly uploadService: UploadService,
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

  // products.service.ts
  async create(
    product: CreateProductDto,
    image?: Express.Multer.File,
  ): Promise<Product> {
    let category: Category | null = null;
    if (product.categoryId) {
      category = await this.categoryService.getCategoryByIdAndSupermarketId(
        product.categoryId,
        product.supermarketId,
      );

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${product.categoryId} not found for supermarket ${product.supermarketId}`,
        );
      }
    }

    const price = product.pricePerPound * product.weight;

    const supermarket = await this.supermarketService.getSupermarket(
      product.supermarketId,
    );

    if (!supermarket) {
      throw new NotFoundException(
        `Supermarket with ID ${product.supermarketId} not found`,
      );
    }

    let imageUrl = null;
    if (image) {
      imageUrl = await this.uploadService.uploadImage(image.path, 'products');
    }

    const newProduct = this.productRepo.create({
      ...product,
      image: imageUrl,
      category,
      supermarket,
      price,
    });

    return await this.productRepo.save(newProduct);
  }

  async update(
    id: number,
    product: UpdateProductDto,
    imageFile?: Express.Multer.File,
  ): Promise<Product> {
    const existingProduct = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'supermarket'],
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    let imageUrl = existingProduct.image;
    if (imageFile) {
      imageUrl = await this.uploadService.uploadImage(
        imageFile.path,
        'products',
      );
    }

    const price =
      (product.pricePerPound ?? existingProduct.pricePerPound) *
      (product.weight ?? existingProduct.weight);

    const updateData = { ...product, image: imageUrl };
    delete updateData.categoryId;

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

      await this.productRepo
        .createQueryBuilder()
        .relation(Product, 'category')
        .of(id)
        .set(category.id);
    }

    await this.productRepo.update(id, {
      ...updateData,
      price,
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
