import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ unique: true })
    email: string

    @Column()
    phoneNumber: string

    @Column()
    password: string

    @CreateDateColumn({ type: 'timestamp', default: Date.now() })
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}