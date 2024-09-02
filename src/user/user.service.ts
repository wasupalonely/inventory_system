import { Injectable } from '@nestjs/common';
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
    return await this.userRepo.findOne({ where: { id } });
  }

  async getUserByIdentifier(identifier: string): Promise<User> {
    return await this.userRepo.findOne({ where: { email: identifier } });
  }

  async create(user: CreateUserDto): Promise<User> {
    return await this.userRepo.save(user);
  }
}
