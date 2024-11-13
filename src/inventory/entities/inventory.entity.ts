// src/inventory/inventory.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'The creation date of the inventory',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'The update date of the inventory',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
