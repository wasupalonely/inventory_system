// src/supermarket/services/seed.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultMeatCuts();
  }

  private async seedDefaultMeatCuts() {
    const DEFAULT_BEEF_CUTS = [
      {
        name: 'Lomo Fino',
        description: 'Corte tierno y magro, ideal para asados y filetes.',
      },
      {
        name: 'Costilla',
        description: 'Corte con hueso, perfecto para sopas y asados.',
      },
      {
        name: 'Punta de Anca',
        description: 'Corte jugoso y sabroso, muy popular en parrillas.',
      },
      {
        name: 'Muchacho',
        description: 'Corte ideal para estofados y asados al horno.',
      },
      {
        name: 'Falda',
        description: 'Corte utilizado para sudados, guisos y sopas.',
      },
      {
        name: 'Solomo de Cuerito',
        description: 'Corte con capa de grasa, ideal para asados lentos.',
      },
      {
        name: 'Posta',
        description:
          'Corte perfecto para guisos y preparaciones tradicionales.',
      },
      {
        name: 'Punta Gorda',
        description: 'Corte magro, excelente para parrillas y asados.',
      },
      {
        name: 'Entraña',
        description: 'Corte delgado, muy sabroso, perfecto para parrillas.',
      },
      {
        name: 'Colita de Cuadril',
        description: 'Corte jugoso y tierno, excelente para asados.',
      },
      {
        name: 'Paletero',
        description: 'Corte con hueso, ideal para estofados y sopas.',
      },
      {
        name: 'Pecho',
        description: 'Corte utilizado para caldos y sopas con mucho sabor.',
      },
      {
        name: 'Hígado',
        description: 'Órgano rico en hierro, ideal para freír o saltear.',
      },
      {
        name: 'Espinazo',
        description: 'Corte con hueso, usado para sopas y caldos sustanciosos.',
      },
      {
        name: 'Rabo',
        description: 'Corte tradicional para preparar caldos y guisos ricos.',
      },
      {
        name: 'Hueso de Res',
        description: 'Corte básico para preparar caldos y fondos de sabor.',
      },
      {
        name: 'Mondongo',
        description: 'Estómago de res, popular en sopas tradicionales.',
      },
      {
        name: 'Chuletas de Res',
        description: 'Corte fino, ideal para freír o asar rápidamente.',
      },
      {
        name: 'Pecho Desmechado',
        description: 'Corte perfecto para sopas y carnes desmechadas.',
      },
      {
        name: 'Cabeza de Res',
        description: 'Usada en caldos y preparaciones tradicionales.',
      },
      {
        name: 'Lengua',
        description: 'Órgano tierno y sabroso, usado en guisos y caldos.',
      },
      {
        name: 'Sesos',
        description: 'Órgano suave, utilizado en platos tradicionales.',
      },
      {
        name: 'Jarrete',
        description: 'Corte perfecto para caldos y sopas espesas.',
      },
    ];

    for (const cut of DEFAULT_BEEF_CUTS) {
      const exists = await this.categoryRepo.findOne({
        where: { name: cut.name, isDefault: true },
      });

      if (!exists) {
        await this.categoryRepo.save({
          ...cut,
          isDefault: true,
        });
        console.log(`Corte de carne predeterminado '${cut.name}' agregado.`);
      } else {
        console.log(`Corte de carne predeterminado '${cut.name}' ya existe.`);
      }
    }

    console.log('Cortes de carne predeterminados inicializados.');
  }
}
