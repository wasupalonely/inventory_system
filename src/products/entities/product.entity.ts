import { ApiProperty } from '@nestjs/swagger';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { SaleItem } from 'src/sales/entities/sale-item.entity';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Lechuga',
    description: 'Nombre del producto',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Lechuga romana',
    description: 'Descripción del producto',
  })
  @Column()
  description: string;

  @ApiProperty({
    example: 1500,
    description: 'El precio del producto',
  })
  @Column()
  price: number;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.products)
  supermarket: Supermarket;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventory: Inventory[];

  @OneToMany(() => SaleItem, (saleItem) => saleItem.product)
  saleItems: SaleItem[];

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Fecha de creación del producto',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Fecha de actualización del producto',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
