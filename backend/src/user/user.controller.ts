import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './user.service';
import {
  CreateUserDTO,
  ActivateUserDTO,
  CreateActivationCodeDTO,
} from 'src/dto/user-dto';

@Controller('user')
export class UserModuleController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDTO): Promise<any> {
    return await this.usersService.create(dto);
  }

  @Post('activate')
  async activate(@Body() dto: ActivateUserDTO): Promise<any> {
    return await this.usersService.activate(dto);
  }

  @Post('recreate-activation')
  async recreate(@Body() dto: CreateActivationCodeDTO): Promise<any> {
    return await this.usersService.createActivationCode(dto);
  }
}
