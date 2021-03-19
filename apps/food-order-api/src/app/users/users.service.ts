import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      id: 1,
      userId: 1,
      username: 'andre',
      password: 'andreisking',
      groups: ['admin']
    },
    {
      id: 2,
      userId: 2,
      username: 'maria',
      password: 'guess',
      groups: ['runner']
    },
  ];

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username.toLowerCase() === username.toLowerCase());
  }
  
  async findOneById(id: number): Promise<User | undefined> {
    return this.users.find(user => user.userId == id);
  }
}