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
} from '@nestjs/common';
import { loginDTO } from '../dto/auth-dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UsersService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: loginDTO) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.getById(req.user.sub);
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
