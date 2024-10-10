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
  @Roles(Role.Admin)
  @Get()
  @ApiResponse({ status: 200, type: [User] })
  getUsers() {
    return this.userService.getUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':id')
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUser(@Param('id') id: number) {
    return this.userService.getUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.Admin)
  @ApiResponse({ status: 201, type: User })
  @ApiResponse({ status: 400, description: 'Bad request' })
  addUserToSupermarket(@Body() user: AddUserToSupermarketDto) {
    return this.userService.addUserToSupermarket(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('supermarket/:id')
  @Roles(Role.Admin, Role.Owner)
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUserFromSupermarket(@Param('id') id: number) {
    return this.userService.deleteUserFromSupermarket(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(@Param('id') id: number, @Body() user: UpdateUserDto) {
    return this.userService.updateUser(+id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(Role.Admin)
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: number) {
    await this.userService.deleteUser(id);
  }

  @ApiResponse({ status: 200, type: Boolean })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('compare-password/:id')
  async comparePasswordByUserId(
    @Param('id') id: number,
    @Body() payload: { password: string },
  ): Promise<boolean> {
    return await this.userService.comparePasswordByUserId(id, payload.password);
  }
}
