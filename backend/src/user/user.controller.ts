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
import { UserGuard } from './user.guard';

@Controller('user')
export class UserModuleController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/:username')
  async getUser(@Param('username') username) {
    const user = await this.usersService.findOne(username);
    return {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      description: user.description,
      email: user.email,
      profilePictureId: user.profilePictureId,
    };
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

  @UseGuards(UserGuard)
  @Put('change_picture')
  async changePicture(@Req() req, @Body() { imageId }) {
    return await this.usersService.changeProfilePicture(imageId, req.user.sub);
  }

  @UseGuards(UserGuard)
  @Put('change_description')
  async change_description(@Req() req, @Body() { description }) {
    return await this.usersService.changeDescription(description, req.user.sub);
  }
}
