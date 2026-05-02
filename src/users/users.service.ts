import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(payload: { email: string; name: string; passwordHash: string }) {
    return this.usersRepository.createAndSave(payload);
  }

  async findByEmail(email: string, includePassword = false) {
    return this.usersRepository.findByEmail(email, includePassword);
  }

  async getByIdOrThrow(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
