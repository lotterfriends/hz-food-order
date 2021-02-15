import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { User, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken'

export interface RefreshTokenPayload {
  jti: number;
  sub: number
}

@Injectable()
export class TokenService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken) private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  private getBaseOptions() {
    return {
      issuer: '' + process.env.HOSTNAME,
      audience: '' + process.env.HOSTNAME,
    }
  }

  public async createRefreshToken (user: User, ttl: number): Promise<RefreshToken> {
    const token = new RefreshToken()

    token.userId = user.id;
    token.isRevoked = false
    
    const expiration = new Date()
    expiration.setTime(expiration.getTime() + ttl)
    
    token.expires = expiration
    return this.refreshTokenRepository.save(token);
  }

  public async findTokenById (id: number): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne(id);
  }

  public async generateAccessToken (user: User): Promise<string> {
    const opts: SignOptions = {
      ...this.getBaseOptions(),
      subject: String(user.id),
    }

    return this.jwtService.signAsync({}, opts)
  }

  public async revokeToken(refreshToken: string) {
    const { token } = await this.resolveRefreshToken(refreshToken);
    token.isRevoked = true;
    this.refreshTokenRepository.save(token);
  }

  public async generateRefreshToken (user: User, expiresIn: number): Promise<string> {
    const token = await this.createRefreshToken(user, expiresIn)

    const opts: SignOptions = {
      ...this.getBaseOptions(),
      expiresIn,
      subject: String(user.id),
      jwtid: String(token.id),
    }

    return this.jwtService.signAsync({}, opts)
  }


  public async resolveRefreshToken (encoded: string): Promise<{ user: User, token: RefreshToken }> {
    const payload = await this.decodeRefreshToken(encoded)
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload)

    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found')
    }

    if (token.isRevoked) {
      throw new UnprocessableEntityException('Refresh token revoked')
    }

    const user = await this.getUserFromRefreshTokenPayload(payload)
    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed')
    }

    return { user, token }
  }

  public async createAccessTokenFromRefreshToken (refresh: string): Promise<{ token: string, user: User }> {
    const { user } = await this.resolveRefreshToken(refresh)

    const token = await this.generateAccessToken(user)

    return { user, token }
  }
  
  private async decodeRefreshToken (token: string): Promise<RefreshTokenPayload> {
    try {
      return this.jwtService.verifyAsync(token)
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired')
      } else {
        throw new UnprocessableEntityException('Refresh token malformed') 
      }
    }
  }

  private async getUserFromRefreshTokenPayload (payload: RefreshTokenPayload): Promise<User> {
    const subId = payload.sub
    if (!subId) {
      throw new UnprocessableEntityException('Refresh token malformed')
    }
    
    return await this.usersService.findOneById(subId); 
  }

  private async getStoredTokenFromRefreshTokenPayload (payload: RefreshTokenPayload): Promise<RefreshToken | null> {
    const tokenId = payload.jti

    if (!tokenId) {
      throw new UnprocessableEntityException('Refresh token malformed')
    }

    return this.findTokenById(tokenId)
  }
}