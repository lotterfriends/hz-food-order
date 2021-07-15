import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../users/roles.enum';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class UserController {
  constructor(
    private readonly userService: UsersService,
  ) {}

  @Post()
  async create(@Body() user: User): Promise<User> {
    if (!user.username || !user.username.length) {
      throw new BadRequestException('Der Name darf nicht leer sein')
    }
    if (user.username && user.username.length) {
      const usernameUser = await this.userService.findOneByUsername(user.username);
      if (usernameUser) {
        throw new BadRequestException('Benutzername bereits vergeben');
      }
    }
    return this.userService.create(user);
  }

  @Put(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: number, @Body() user: User): Promise<User> {
    return this.userService.updateUser(id, user);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.userService.delete(id);
  }


  @Get()
  async getAll(): Promise<User[]> {
    return this.userService.getAll();
  }

}
