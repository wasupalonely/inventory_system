import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/shared/enums/roles.enum';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'User name',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'uq0Jt@example.com',
    description: 'User email',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: '123456789',
    description: 'User phone number',
  })
  @Column()
  phoneNumber: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @Column()
  password: string;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.users)
  supermarket: Supermarket;

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

  @ApiProperty({
    example: 'cashier',
    description: 'User role',
    default: 'viewer',
  })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Viewer,
  })
  role: Role;
}
