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
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { Roles } from 'src/shared/decorators/roles.decorators';
import { Role } from 'src/shared/enums/roles.enum';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { AddUserToSupermarketDto } from './dto/no-admin-user.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin, Role.Owner, Role.Viewer, Role)
  @Get()
  @ApiResponse({ status: 200, type: [User] })
  getUsers() {
    return this.userService.getUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Owner, Role.Viewer)
  @Get('supermarket/:supermarketId')
  @ApiResponse({ status: 200, type: [User] })
  getUsersBySupermarketId(@Param('supermarketId') supermarketId: number) {
    return this.userService.getUsersBySupermarketId(supermarketId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getUser(@Param('id') id: number) {
    return this.userService.getUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.Admin, Role.Owner)
  @ApiResponse({ status: 201, type: User })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  addUserToSupermarket(@Body() user: AddUserToSupermarketDto) {
    return this.userService.addUserToSupermarket(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('supermarket/:id')
  @Roles(Role.Admin, Role.Owner)
  @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  deleteUserFromSupermarket(@Param('id') id: number) {
    return this.userService.deleteUserFromSupermarket(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  updateUser(@Param('id') id: number, @Body() user: UpdateUserDto) {
    return this.userService.updateUser(+id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(Role.Admin, Role.Owner)
  @ApiResponse({ status: 204, description: 'Usuario eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteUser(@Param('id') id: number) {
    await this.userService.deleteUser(id);
  }

  @ApiResponse({ status: 200, type: Boolean })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Post('compare-password/:id')
  async comparePasswordByUserId(
    @Param('id') id: number,
    @Body() payload: { password: string },
  ): Promise<boolean> {
    return await this.userService.comparePasswordByUserId(id, payload.password);
  }
}
