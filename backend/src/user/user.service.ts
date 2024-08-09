import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../schemes/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDTO } from '../dto/create-user-dto';
import { readFile } from 'node:fs/promises';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

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

async function sendActivationEmail(toEmail, activationCode) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    service: 'Gmail',
    auth: {
      user: 'emredilek6@gmail.com',
      pass: process.env.EMAILPASS,
    },
  });

  return new Promise(async (resolve) => {
    const mailOptions = {
      from: 'emredilek6@gmail.com',
      to: toEmail,
      subject: 'Your Activation Code',
      text: `Your activation code is: ${activationCode}`,
      html: `<p>Your activation code is: <strong>${activationCode}</strong></p>`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
        resolve(false);
      }
      console.log('Email sent: ' + info.response);
      resolve(true);
    });
  });
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(dto: CreateUserDTO): Promise<User> {
    const { username, email, password } = dto;
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

    const existingEmail = await this.userModel.findOne({ email }).exec();

    if (existingEmail) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email address already in use',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUsername = await this.userModel.findOne({ username }).exec();

    if (existingUsername) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Username is already in use',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    const activationCode = Math.floor(Math.random() * 1000000);

    const isActivationSent = await sendActivationEmail(email, activationCode);
    if (!isActivationSent) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There has been an error, please try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const createdUser = new this.userModel({
      ...dto,
      password: encryptedPassword,
      isActivated: false,
      activationCode,
    });

    return await createdUser.save();
  }
}
