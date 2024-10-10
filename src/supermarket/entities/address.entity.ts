import { ApiProperty } from '@nestjs/swagger';
import { LocationType } from 'src/shared/enums/location-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Supermarket } from './supermarket.entity';

@Entity()
export class Address {
  @ApiProperty({
    example: 1,
    description: 'Dirección ID',
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
    description: 'Número de la calle',
  })
  @Column()
  streetNumber: string;

  @ApiProperty({
    example: '4W',
    description: 'Número de intersección de la calle',
  })
  @Column({ nullable: true })
  intersectionNumber: string;

  @ApiProperty({
    example: '05',
    description: 'número de la calle del edificio',
  })
  @Column({
    nullable: true,
  })
  buildingNumber: string;

  @ApiProperty({
    example: 'Segundo piso',
    description: 'Información complementaria',
  })
  @Column({
    nullable: true,
  })
  additionalInfo: string;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Fecha de creación del usuario',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    example: '2020-01-01T00:00:00.000Z',
    description: 'Fecha de actualización del usuario',
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
