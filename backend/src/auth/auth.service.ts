import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { loginDTO } from 'src/dto/auth-dto';
import { UsersService } from 'src/user/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: loginDTO) {
    const user = await this.usersService.findOne(
      'username' in dto ? dto.username : dto.email,
    );

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User not found.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { password, _id, username } = user;

    const isPasswordsMatch = compare(dto.password, password);

    if (!isPasswordsMatch) {
      throw new UnauthorizedException();
    }
    const payload = { sub: _id, username };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
