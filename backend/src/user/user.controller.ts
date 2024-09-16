import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Put,
  Get,
  Param,
} from '@nestjs/common';
import { UsersService } from './user.service';
import {
  CreateUserDTO,
  ActivateUserDTO,
  CreateActivationCodeDTO,
} from 'src/dto/user-dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('follow/:username')
  async followUser(@Req() req, @Param('username') username) {
    return await this.usersService.follow(username, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('profile/:username')
  async getUser(@Req() req, @Param('username') username) {
    return this.usersService.getUserInfo(req.user.sub, username);
  }

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

  @UseGuards(AuthGuard)
  @Put('change_picture')
  async changePicture(@Req() req, @Body() { imageId }) {
    return await this.usersService.changeProfilePicture(imageId, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Put('change_description')
  async changeDescription(@Req() req, @Body() { description }) {
    return await this.usersService.changeDescription(description, req.user.sub);
  }
}
