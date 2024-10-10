import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import { Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category } from './entities/category.entity';

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
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return;
  }

  async getCategoryByIdAndSupermarketId(
    id: number,
    supermarketId: number,
  ): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, supermarket: { id: supermarketId } },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoría con ID ${id} no encontrada en supermercado ${supermarketId}`,
      );
    }
    return category;
  }

  async create(category: CreateCategoryDto): Promise<Category> {
    const supermarket = await this.supermarketService.getSupermarket(
      category.supermarketId,
    );

    console.log('SUPERMARKET', supermarket);

    if (!supermarket) {
      throw new NotFoundException(
        `Supermercado con ID ${category.supermarketId} no encontrado`,
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
        `La categoría con el nombre ${category.name} ya existe para este supermercado.`,
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
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return await this.categoryRepo.save({ ...category, id });
  }

  async delete(id: number): Promise<void> {
    await this.categoryRepo.delete({ id });
  }
}
