import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/categories/entities/category.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Product } from 'src/products/entities/product.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.entity';

@Entity({ name: 'supermarket' })
export class Supermarket {
  @ApiProperty({
    example: 1,
    description: 'Supermarket ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Supermarket 123',
    description: 'Nombre del supermercado',
  })
  @Column()
  name: string;

  @OneToOne(() => Address, (address) => address.supermarket, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  address: Address;

  @OneToOne(() => User, (user) => user.ownedSupermarket)
  @JoinColumn()
  owner: User;

  @OneToMany(() => Category, (category) => category.supermarket, { cascade: true, onDelete: 'CASCADE' })
  categories: Category[];

  @OneToMany(() => User, (user) => user.supermarket, { cascade: true, onDelete: 'CASCADE' })
  users: User[];

  @OneToMany(() => Product, (product) => product.supermarket, { cascade: true, onDelete: 'CASCADE' })
  products: Product[];

  @OneToMany(() => Inventory, (inventory) => inventory.supermarket, { cascade: true, onDelete: 'CASCADE' })
  inventory: Inventory[];

  @OneToMany(() => Sale, (sale) => sale.supermarket, { cascade: true, onDelete: 'CASCADE' })
  sales: Sale[];

  @Column({ default: false })
  cronjobEnabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

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
