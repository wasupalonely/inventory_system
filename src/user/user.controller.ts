import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { AddUserToSupermarketDto } from './dto/no-admin-user.dto';
import { UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('User')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.Admin)
  @Get()
  @ApiResponse({ status: 200, type: [User] })
  getUsers() {
    return this.userService.getUsers();
  }

  @Roles(Role.Admin)
  @Get(':id')
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getUser(@Param('id') id: number) {
    return this.userService.getUser(id);
  }

  @Post()
  @Roles(Role.Admin)
  @ApiResponse({ status: 201, type: User })
  @ApiResponse({ status: 400, description: 'Mala petición' })
  addUserToSupermarket(@Body() user: AddUserToSupermarketDto) {
    return this.userService.addUserToSupermarket(user);
  }

  @Put(':id')
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 400, description: 'Mala petición' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  updateUser(@Param('id') id: number, @Body() user: UpdateUserDto) {
    return this.userService.updateUser(+id, user);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteUser(@Param('id') id: number) {
    await this.userService.deleteUser(id);
  }

  @ApiResponse({ status: 200, type: Boolean })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Post('compare-password/:id')
  async comparePasswordByUserId(@Param('id') id: number, @Body() payload: { password: string }): Promise<boolean> {
    return await this.userService.comparePasswordByUserId(id, payload.password);
  }
}
