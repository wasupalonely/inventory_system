import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { SupermarketService } from 'src/supermarket/supermarket.service';
import {
  AddUserToSupermarketDto,
  UpdateUserNoAdminDto,
} from './dto/no-admin-user.dto';
import { Role } from 'src/shared/enums/roles.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(forwardRef(() => SupermarketService))
    private readonly supermarketService: SupermarketService,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async getUser(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['supermarket', 'ownedSupermarket'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async validateUserExistence(identifier: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email: identifier } });
    return !!user;
  }

  async getUserByIdentifier(identifier: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { email: identifier },
      relations: ['supermarket', 'ownedSupermarket'],
    });
    if (!user) {
      throw new NotFoundException(`User with email ${identifier} not found`);
    }
    return user;
  }

  async create(user: CreateUserDto): Promise<User> {
    const userCreated = await this.userRepo.save(user);
    const userWithoutPassword = { ...userCreated, password: undefined };
    return userWithoutPassword;
  }

  private isUpdateUserNoAdminDto(
    user: UpdateUserDto | UpdateUserNoAdminDto,
  ): user is UpdateUserNoAdminDto {
    return (user as UpdateUserNoAdminDto).supermarketId !== undefined;
  }

  async updateUser(
    id: number,
    user: UpdateUserDto | UpdateUserNoAdminDto,
  ): Promise<User> {
    try {
      const userToUpdate = await this.getUser(id);

      if (this.isUpdateUserNoAdminDto(user)) {
        const supermarket = await this.supermarketService.getSupermarket(
          user.supermarketId,
        );
        if (!supermarket) {
          throw new NotFoundException(
            `Supermarket with ID ${user.supermarketId} not found`,
          );
        }

        userToUpdate.supermarket = supermarket;
      }

      return await this.userRepo.save({
        ...userToUpdate,
        ...user,
      });
    } catch (error) {
      throw error;
    }
  }

  async addUserToSupermarket(user: AddUserToSupermarketDto): Promise<User> {
    const userValidation = await this.validateUserExistence(user.email);
    if (userValidation) {
      throw new BadRequestException('User already exists');
    }

    if (user.role === Role.Admin) {
      throw new BadRequestException('No se puede agregar un administrador');
    }

    const supermarket = await this.userRepo.findOne({
      where: { id: user.supermarketId },
    });

    if (!supermarket) {
      throw new NotFoundException(
        `Supermarket with ID ${user.supermarketId} not found`,
      );
    }

    user.password = bcrypt.hashSync(user.password, 10);
    const userCreated = this.userRepo.create({
      ...user,
      isConfirmed: true,
      supermarket: supermarket,
    });

    await this.userRepo.save(userCreated);
    const userWithoutPassword = { ...userCreated, password: undefined };

    return userWithoutPassword;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const user = await this.getUser(id);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      await this.userRepo.delete(id);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async markUserAsConfirmed(id: number): Promise<User> {
    const user = await this.getUser(id);
    user.isConfirmed = true;
    return await this.userRepo.save(user);
  }

  async updatePassword(id: number, password: string): Promise<User> {
    const user = await this.getUser(id);
    user.password = bcrypt.hashSync(password, 10);
    return await this.userRepo.save(user);
  }

  async comparePasswordByUserId(id: number, password: string): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return bcrypt.compareSync(password, user.password);
  }
}
