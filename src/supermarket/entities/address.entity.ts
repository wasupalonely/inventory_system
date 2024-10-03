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
    example: 'Calle 123',
    description: 'Street name',
  })
  @Column()
  streetName: string;

  @ApiProperty({
    example: '14A',
    description: 'Street number',
    nullable: true,
  })
  @Column()
  streetNumber: string;

  @Column({
    type: 'enum',
    enum: LocationType,
  })
  locationType: LocationType;

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
