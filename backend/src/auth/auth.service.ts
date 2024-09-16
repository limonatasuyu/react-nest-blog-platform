import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { loginDTO } from '../dto/auth-dto';
import { UsersService } from '../user/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schemes/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async login(dto: loginDTO) {
    const user = await this.usersService.findOne(
      'username' in dto ? dto.username : dto.email,
    );
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { password, _id, username } = user;

    const isPasswordsMatch = await compare(dto.password, password);

    if (!isPasswordsMatch) {
      throw new UnauthorizedException('Password is incorrect.');
    }
    const payload = { sub: _id, username };

    return {
      access_token: await this.jwtService.signAsync(payload),
      message: 'Login successfull.',
    };
  }

  async getChangePasswordToken(userId: string, currentPassword: string) {
    const user = await this.usersService.findById(userId);

    if (!user) throw new BadRequestException('User not found.');

    const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
    const passwordLastUpdatedAt = new Date(
      user.passwordLastUpdatedAt,
    ).getTime();
    const currentTime = new Date().getTime();

    if (
      passwordLastUpdatedAt &&
      currentTime - passwordLastUpdatedAt < ONE_MONTH_IN_MS
    ) {
      throw new BadRequestException(
        'Your password has been changed in the last month. Please wait before trying to change it again.',
      );
    }

    const isPasswordsMatch = await compare(currentPassword, user.password);

    if (!isPasswordsMatch) {
      throw new UnauthorizedException('Password is incorrect.');
    }

    const payload = {
      sub: userId,
      passwordHash: user.password,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '5m',
    });

    return { token };
  }

  async changePassword(
    newPassword: string,
    newPasswordAgain: string,
    userId: string,
    token,
  ) {
    await this.verifyChangePasswordToken(token);
    if (newPassword !== newPasswordAgain) {
      throw new InternalServerErrorException('Passwords do not match');
    }

    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updatedUser = await this.userModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { password: encryptedPassword, passwordLastUpdatedAt: new Date() },
    );

    if (!updatedUser || !updatedUser.matchedCount) {
      throw new InternalServerErrorException();
    }

    return { message: 'Password changed succesfully.' };
  }

  private async verifyChangePasswordToken(token: string) {
    try {
      // Decode the token
      const payload = this.jwtService.verify(token);

      const user = await this.usersService.findById(payload.sub);

      if (!user) throw new UnauthorizedException('User not found.');
      // Verify the current password hash matches the one in the token
      if (user.password !== payload.passwordHash) {
        throw new UnauthorizedException('Token verification failed.');
      }

      // Token is valid
      return user;
    } catch (error) {
      throw new UnauthorizedException('Token verification failed.');
    }
  }
}
