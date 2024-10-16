import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Supermarket } from './supermarket.entity';
import { LocationType } from 'src/shared/enums/location-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Address {
  @ApiProperty({
    example: 1,
    description: 'Address ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Royal Palace',
    description: 'Supermarket neighborhood',
  })
  @Column()
  neighborhood: string;

  @Column({
    type: 'enum',
    enum: LocationType,
  })
  locationType: LocationType;

  @ApiProperty({
    example: '37',
    description: 'Street number',
  })
  @Column()
  streetNumber: string;

  @ApiProperty({
    example: '4W',
    description: 'Intersection number of the street',
  })
  @Column({ nullable: true })
  intersectionNumber: string;

  @ApiProperty({
    example: '05',
    description: 'building street number',
  })
  @Column({
    nullable: true,
  })
  buildingNumber: string;

  @ApiProperty({
    example: 'Second Floor',
    description: 'Additional information',
  })
  @Column({
    nullable: true,
  })
  additionalInfo: string;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'User creation date',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'User update date',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  // @Column()
  // city: string;

  // @Column()
  // state: string;

  // @Column({ nullable: true })
  // zipCode: string;

  @OneToOne(() => Supermarket, (supermarket) => supermarket.address)
  supermarket: Supermarket;
}
