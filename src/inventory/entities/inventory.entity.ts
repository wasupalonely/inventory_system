// src/inventory/inventory.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Inventory {
  @ApiProperty({
    example: 1,
    description: 'Id del inventario',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.inventory)
  product: Product;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.inventory)
  supermarket: Supermarket;

  @ApiProperty({
    example: 10,
    description: 'Las existencias del producto en el inventario',
  })
  @Column({ type: 'int' })
  stock: number;
}
