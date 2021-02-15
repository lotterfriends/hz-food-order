import { Injectable } from '@nestjs/common';
import { User, UsersService } from '../users/users.service';
import { TokenService } from './token.service';

export interface AuthenticationPayload {
  user: User
  payload: {
    type: string
    token: string
    refresh_token?: string
  }
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const token = await this.tokenService.generateAccessToken(user)
    const refresh = await this.tokenService.generateRefreshToken(user, 60 * 60 * 24 * 30)
    return this.buildResponsePayload(user, token, refresh)
  }

  private buildResponsePayload (user: User, accessToken: string, refreshToken?: string): AuthenticationPayload {
    return {
      user: user,
      payload: {
        type: 'bearer',
        token: accessToken,
        ...(refreshToken ? { refresh_token: refreshToken } : {}),
      }
    }
  }

  async refresh(body: {refresh_token: string}) {
    const { user, token } = await this.tokenService.createAccessTokenFromRefreshToken(body.refresh_token)
    return this.buildResponsePayload(user, token)
  }

  logout(body: {refresh_token: string}) {
    return this.tokenService.revokeToken(body.refresh_token);
  }
}