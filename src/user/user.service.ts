import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async getUsers(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async getUser(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByIdentifier(identifier: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email: identifier } });
    if (!user) {
      throw new NotFoundException(`User with email ${identifier} not found`);
    }
    return user;
  }

  async create(user: CreateUserDto): Promise<User> {
    return await this.userRepo.save(user);
  }
}
