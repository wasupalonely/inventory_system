import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private readonly supermarketService: SupermarketService,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepo.find({ relations: ['supermarket'] });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return;
  }

  async create(category: CreateCategoryDto): Promise<Category> {
    const supermarket = await this.supermarketService.getSupermarket(
      category.supermarketId,
    );

    console.log('SUPERMARKET', supermarket);

    if (!supermarket) {
      throw new NotFoundException(
        `Supermarket with ID ${category.supermarketId} not found`,
      );
    }

    const existingCategory = await this.categoryRepo.findOne({
      where: {
        name: category.name,
        supermarket: { id: category.supermarketId },
      },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with name ${category.name} already exists for this supermarket`,
      );
    }

    const categoryCreated = await this.categoryRepo.create({
      ...category,
      supermarket,
    });

    return await this.categoryRepo.save(categoryCreated);
  }

  async getCategoriesBySupermarket(supermarketId: number): Promise<Category[]> {
    return await this.categoryRepo.find({
      where: { supermarket: { id: supermarketId } },
    });
  }

  async update(id: number, category: UpdateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepo.findOne({ where: { id } });
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return await this.categoryRepo.save({ ...category, id });
  }

  async delete(id: number): Promise<void> {
    await this.categoryRepo.delete({ id });
  }
}
