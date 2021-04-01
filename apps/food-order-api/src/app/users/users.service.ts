import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
  
  async findOneByUsername(username: string): Promise<User | undefined> {
    const users = await this.userRepository.find();
    return users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }

  async findOneByUsernameWithPassword(username: string): Promise<User | undefined> {
    const users = await this.userRepository.find({
      select: ['username', 'password', 'id']
    });
    return users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }
  
  async findOneById(id: number): Promise<User | undefined> {
    const users = await this.userRepository.find();
    return users.find(user => user.id == id);
  }
}