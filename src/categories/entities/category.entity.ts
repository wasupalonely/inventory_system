import { ApiProperty } from '@nestjs/swagger';
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
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @ApiProperty({
    example: 1,
    description: 'ID de categoria',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Frutas tropicales',
    description: 'El nombre de la categoría',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Categoría de frutas',
    description: 'Descripción de la categoría',
  })
  @Column()
  description: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.categories, {
    onDelete: 'CASCADE',
  })
  supermarket: Supermarket;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Fecha de creación del supermercado',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Fecha de actualización del supermercado',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
