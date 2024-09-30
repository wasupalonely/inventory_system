// src/inventory/inventory.entity.ts
import { Product } from 'src/products/entities/product.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.inventory)
  product: Product;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.inventory)
  supermarket: Supermarket;

  @Column({ type: 'int' })
  stock: number;
}
