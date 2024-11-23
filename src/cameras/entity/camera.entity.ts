// src/supermarket/entities/camera.entity.ts
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import { Prediction } from 'src/predictions/entities/prediction.entity';

@Entity('cameras')
export class Camera {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Camera 1',
    description: 'Name or identifier for the camera',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Over the meat section',
    description: 'Description of where the camera is located',
  })
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.cameras, {
    onDelete: 'CASCADE',
  })
  supermarket: Supermarket;

  @OneToMany(() => Prediction, (prediction) => prediction.camera)
  predictions: Prediction[];
}
