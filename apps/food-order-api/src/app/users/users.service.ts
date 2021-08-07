import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {

  async hasUser(): Promise<boolean> {
    const result = await this.userRepository.count({
      where: {
        active: true
      }
    });
    return result > 0;
  }
  
  delete(id: number): Promise<DeleteResult> {
    return this.userRepository.softDelete(id);
  }
  
  async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
  
  async updateUser(id: number, user: User): Promise<User> {
    await this.userRepository.update(id, user);
    return this.userRepository.findOne(id);
  }

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
  
  async findOneByUsername(username: string): Promise<User | undefined> {
    const users = await this.userRepository.find();
    return users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }

  async findOneByUsernameWithPassword(username: string): Promise<User | undefined> {
    const users = await this.userRepository.find({
      select: ['username', 'password', 'id', 'roles', 'active']
    });
    return users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }
  
  async findOneById(id: number): Promise<User | undefined> {
    const users = await this.userRepository.find();
    return users.find(user => user.id == id);
  }

  async getAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}