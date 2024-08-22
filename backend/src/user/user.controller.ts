import { Controller, Post, Body, UseGuards, Req, Put } from '@nestjs/common';
import { UsersService } from './user.service';
import {
  CreateUserDTO,
  ActivateUserDTO,
  CreateActivationCodeDTO,
} from 'src/dto/user-dto';
import { UserGuard } from './user.guard';

@Controller('user')
export class UserModuleController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign')
  async create(@Body() dto: CreateUserDTO): Promise<any> {
    return await this.usersService.create(dto);
  }

  @Post('activate')
  async activate(@Body() dto: ActivateUserDTO): Promise<any> {
    return await this.usersService.activate(dto);
  }

  @Post('recreate-activation')
  async recreateActivation(@Body() dto: CreateActivationCodeDTO): Promise<any> {
    return await this.usersService.createActivationCode(dto);
  }

  @UseGuards(UserGuard)
  @Put('change_picture')
  async changePicture(@Req() req, @Body() { imageId }) {
    return await this.usersService.changeProfilePicture(imageId, req.user.sub);
  }
}
