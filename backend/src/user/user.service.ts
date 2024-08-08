import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../schemes/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDTO } from '../dto/create-user-dto';
import { readFile } from 'node:fs/promises';
import * as bcrypt from 'bcrypt';

let blocklist;
async function isDisposable(email: string) {
  if (!blocklist) {
    const content = await readFile('disposable_email_blocklist.conf', {
      encoding: 'utf-8',
    });
    blocklist = content.split('\n').slice(0, -1);
  }
  return blocklist.includes(email.split('@')[1]);
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(dto: CreateUserDTO): Promise<User> {
    const { email, password } = dto;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || (await isDisposable(email))) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email address is not valid',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);
    const createdUser = new this.userModel({
      ...dto,
      password: encryptedPassword,
    });
    return await createdUser.save();
  }
}
