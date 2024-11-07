// src/inventory/inventory.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Inventory {
  @ApiProperty({
    example: 1,
    description: 'The id of the inventory',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.inventory, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.inventory, {
    onDelete: 'CASCADE',
  })
  supermarket: Supermarket;

  @ApiProperty({
    example: 10,
    description: 'The stock of the product in the inventory',
  })
  @Column({ type: 'int' })
  stock: number;
}
