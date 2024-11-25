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
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Camera } from 'src/cameras/entity/camera.entity';

@Entity('categories')
export class Category {
  @ApiProperty({
    example: 1,
    description: 'Category ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Lomo fino',
    description: 'The name of the cut',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: '12',
    description: 'THe description of the cut',
  })
  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isDefault: boolean; // Si es un corte predeterminado

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.categories, {
    onDelete: 'CASCADE',
  })
  supermarket: Supermarket;

  @OneToMany(() => Camera, (camera) => camera.category)
  cameras: Camera[];

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
