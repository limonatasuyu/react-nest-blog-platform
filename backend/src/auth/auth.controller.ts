import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  Req,
  InternalServerErrorException,
} from '@nestjs/common';
import { loginDTO } from '../dto/auth-dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UsersService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: loginDTO) {
    return await this.authService.login(dto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) {
      throw new InternalServerErrorException('User not found.');
    }
    return {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      profilePictureId: user.profilePictureId,
    };
  }

  @UseGuards(AuthGuard)
  @Post('change_password_one')
  async getChangePasswordToken(@Req() req, @Body() { password }) {
    return await this.authService.getChangePasswordToken(
      req.user.sub,
      password,
    );
  }

  @UseGuards(AuthGuard)
  @Post('change_password_two')
  async changePassword(
    @Req() req,
    @Body() { newPassword, newPasswordAgain, token },
  ) {
    return await this.authService.changePassword(
      newPassword,
      newPasswordAgain,
      req.user.sub,
      token,
    );
  }
}
