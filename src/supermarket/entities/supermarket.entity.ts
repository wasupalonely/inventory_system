import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { ScheduleFrequency } from 'src/shared/enums/schedule-frequency';
import { Prediction } from 'src/predictions/entities/prediction.entity';
import { Notification } from 'src/notifications/entities/notifications.entity';

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
    description: 'Supermarket name',
  })
  @Column()
  name: string;

  @OneToOne(() => Address, (address) => address.supermarket, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  address: Address;

  @OneToOne(() => User, (user) => user.ownedSupermarket)
  @JoinColumn()
  owner: User;

  @OneToMany(() => Category, (category) => category.supermarket, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  categories: Category[];

  @OneToMany(() => User, (user) => user.supermarket, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  users: User[];

  @OneToMany(() => Product, (product) => product.supermarket, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  products: Product[];

  @OneToMany(() => Inventory, (inventory) => inventory.supermarket, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  inventory: Inventory[];

  @OneToMany(() => Sale, (sale) => sale.supermarket, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  sales: Sale[];

  @OneToMany(() => Prediction, (prediction) => prediction.supermarket, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  predictions: Prediction[];

  @OneToMany(() => Notification, (notification) => notification.supermarket, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  notifications: Notification[];

  @Column({ default: false })
  cronjobEnabled: boolean;

  @Column({
    type: 'enum',
    enum: ScheduleFrequency,
    default: ScheduleFrequency.EVERY_MINUTE,
  })
  scheduleFrequency: ScheduleFrequency;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Supermarket creation date',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Supermarket update date',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
