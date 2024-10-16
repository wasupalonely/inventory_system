import { ApiProperty } from '@nestjs/swagger';
import { Sale } from 'src/sales/entities/sale.entity';
import { Role } from 'src/shared/enums/roles.enum';
import { Supermarket } from 'src/supermarket/entities/supermarket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
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
    example: 'John',
    description: "Primer nombre",
  })
  @Column()
  firstName: string;

  @ApiProperty({
    example: 'David',
    description: "Segundo nombre",
  })
  @Column({ nullable: true })
  middleName: string;

  @ApiProperty({
    example: 'Doe',
    description: "Primer apellido",
  })
  @Column()
  lastName: string;

  @ApiProperty({
    example: 'Doe',
    description: "Segundo apellido",
  })
  @Column({ nullable: true })
  secondLastName: string;

  @ApiProperty({
    example: 'uq0Jt@example.com',
    description: 'Correo electrónico del usuario',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: '123456789',
    description: 'Número de teléfono del usuario',
  })
  @Column()
  phoneNumber: string;

  @ApiProperty({
    example: 'Password123@',
    description: 'Contraseña de usuario',
  })
  @Column()
  password: string;

  @ApiProperty({
    example: true,
    description: 'Estado de confirmación de la cuenta de usuario',
  })
  @Column({ default: false })
  isConfirmed: boolean;

  @ManyToOne(() => Supermarket, (supermarket) => supermarket.users, {
    onDelete: 'CASCADE',
  })
  supermarket: Supermarket;

  @OneToOne(() => Supermarket, (supermarket) => supermarket.owner)
  ownedSupermarket: Supermarket;

  @OneToMany(() => Sale, (sale) => sale.user)
  sales: Sale[];

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

  getFullName?(): string {
    return `${this.firstName}${this.middleName ?? ' '}${this.lastName} ${this.secondLastName ?? ''}`.trim();
  }
}
