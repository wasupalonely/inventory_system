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
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(forwardRef(() => SupermarketService))
    private readonly supermarketService: SupermarketService,
    private readonly uploadService: UploadService,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async getUsersBySupermarketId(supermarketId: number): Promise<User[]> {
    await this.supermarketService.getSupermarket(supermarketId);

    return await this.userRepo.find({
      where: { supermarket: { id: supermarketId } },
    });
  }

  async getUser(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['supermarket', 'ownedSupermarket'],
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ${id} no encontrado`);
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
      throw new NotFoundException(
        `Usuario con email ${identifier} no encontrado`,
      );
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
            `Supermercado con ID ${user.supermarketId} no encontrado`,
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
      throw new BadRequestException('El usuario ya existe.');
    }

    if (user.role === Role.Owner) {
      throw new BadRequestException('No se puede agregar un dueño');
    }

    const supermarket = await this.supermarketService.getSupermarket(
      user.supermarketId,
    );

    if (!supermarket) {
      throw new NotFoundException(
        `Supermercado con ID ${user.supermarketId} no encontrado`,
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

  async deleteUserFromSupermarket(
    id: number,
  ): Promise<{ success: boolean; message?: string }> {
    const user = await this.getUser(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    await this.userRepo.delete(id);
    return {
      success: true,
      message: `Usuario con ID ${id} borrado satisfactoriamente del supermercado`,
    };
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const user = await this.getUser(id);
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
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
    const passwordRequirements: RegExp =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d).{9,20}$/;

    if (!password.match(passwordRequirements)) {
      throw new BadRequestException(
        'La contraseña debe tener entre 9 y 20 caracteres, al menos 1 letra mayúscula, 1 número y 1 carácter especial.',
      );
    }

    const user = await this.getUser(id);
    user.password = bcrypt.hashSync(password, 10);
    return await this.userRepo.save(user);
  }

  async comparePasswordByUserId(
    id: number,
    password: string,
  ): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return bcrypt.compareSync(password, user.password);
  }

  async updateProfileImage(
    userId: number,
    imageFile: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const imageUrl = await this.uploadService.uploadImage(
      imageFile.path,
      'user',
    );

    user.profileImage = imageUrl;
    await this.userRepo.save(user);

    return user;
  }
}
