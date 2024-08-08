import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDTO } from 'src/dto/create-user-dto';

@Controller('user')
export class UserModuleController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDTO): Promise<any> {
    return await this.usersService.create(dto);
  }
}
