import { Controller, Get, Post, UseGuards, Request, Body, Param, Res, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { User } from './users/user.entity';
import { Role } from './users/roles.enum';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('auth/refresh')
  refresh(@Body() body) {
    return this.authService.refresh(body);
  }

  @Post('auth/logout')
  logout(@Body() body) {
    return this.authService.logout(body);
  }

  @Get('file/:imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './uploads' });
  }

  @Get('has-user')
  hasUser(): Promise<boolean> {
    return this.usersService.hasUser();
  }
  
  @Post('create-admin')
  async create(@Body() user: User): Promise<void> {
    if (await this.usersService.hasUser()) {
      throw new ForbiddenException('not allowed')
    }
    user.roles = Object.values(Role);
    user.active = true;
    this.usersService.create(user);
  }


}
