import { BadRequestException, Injectable, InternalServerErrorException, RequestTimeoutException } from '@nestjs/common';
import { User } from '../schemes/user.schema';
import { ActivationCode } from '../schemes/activationCode.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'bson';
import {
  ActivateUserDTO,
  CreateUserDTO,
  CreateActivationCodeDTO,
} from '../dto/user-dto';
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
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ActivationCode.name)
    private activationCodeModel: Model<ActivationCode>,
  ) {}

  async activate(dto: ActivateUserDTO) {
    const user = await this.userModel.findOne({
      _id: dto.user_id,
    });
    if (!user) {
      throw new InternalServerErrorException();
    }

    const activationCodes = await this.activationCodeModel.find({
      user_id: dto.user_id,
    });
    if (!activationCodes || !activationCodes.length) {
      throw new InternalServerErrorException();
    }

    const codeToCheck = activationCodes.reduce((latest, obj) => {
      return new Date(obj.createdAt) > new Date(latest.createdAt)
        ? obj
        : latest;
    });

    if (codeToCheck.tryCount >= 3) {
      throw new BadRequestException("Code tried out or somthin")
    }

    const fiveMinutesInMs = 5 * 60 * 1000;
    if (
      Math.abs(
        new Date().getTime() - new Date(codeToCheck.createdAt).getTime(),
      ) >= fiveMinutesInMs
    ) {
      throw new BadRequestException("Activation code is timed out or smt, idk")
    }

    if (Number(dto.activationCode) !== Number(codeToCheck.code)) {
      await this.activationCodeModel.updateOne(
        { user_id: dto.user_id },
        { tryCount: codeToCheck.tryCount + 1 },
      );

      throw new BadRequestException("Code is incorrect.")
    }

    await this.userModel.updateOne({ _id: dto.user_id }, { isActivated: true });

    return { message: 'User activated successfully' };
  }

  async create(dto: CreateUserDTO): Promise<any> {
    const { username, email, password } = dto;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || (await isDisposable(email))) {
      throw new BadRequestException("Email address is not valid.")
    }

    const existingEmail = await this.userModel.findOne({ email }).exec();

    if (existingEmail) {
      throw new BadRequestException("Email address already in use")
    }

    const existingUsername = await this.userModel.findOne({ username }).exec();

    if (existingUsername) {
      throw new BadRequestException("Username is already in use")
    }

    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    const activationCode = Math.floor(Math.random() * 1000000);

    const isActivationSent = await sendActivationEmail(email, activationCode);
    if (!isActivationSent) {
      throw new InternalServerErrorException();
    }

    const createdUser = new this.userModel({
      ...dto,
      password: encryptedPassword,
      isActivated: false,
      _id: new ObjectId(),
    });

    const createdActivationCode = new this.activationCodeModel({
      user_id: createdUser._id,
      code: activationCode,
      tryCount: 0,
      createdAt: new Date(),
    });

    await createdUser.save();
    await createdActivationCode.save();
    return { message: 'User created sucessfully.', user_id: createdUser._id };
  }

  async createActivationCode(dto: CreateActivationCodeDTO) {
    const user = await this.userModel.findOne({ _id: dto.user_id });
    if (!user) {
      throw new InternalServerErrorException();
    }

    const activationCodes = await this.activationCodeModel.find({
      user_id: dto.user_id,
    });
    if (!activationCodes) {
      throw new InternalServerErrorException();
    }

    const codeToCheck = activationCodes.reduce((latest, obj) => {
      return new Date(obj.createdAt) > new Date(latest.createdAt)
        ? obj
        : latest;
    });

    const fiveMinutesInMs = 5 * 60 * 1000;
    if (
      Math.abs(
        new Date().getTime() - new Date(codeToCheck.createdAt).getTime(),
      ) < fiveMinutesInMs
    ) {
      throw new RequestTimeoutException("Please wait for 5 minutes before try to create a new code.")
    }

    const activationCode = Math.floor(Math.random() * 1000000);

    const isActivationSent = await sendActivationEmail(
      user.email,
      activationCode,
    );
    if (!isActivationSent) {
      throw new InternalServerErrorException();
    }

    const createdActivationCode = new this.activationCodeModel({
      user_id: dto.user_id,
      code: activationCode,
      tryCount: 0,
      createdAt: new Date(),
    });

    await createdActivationCode.save();
    return;
  }

  async findOne(usernameOrEmail: string): Promise<User | undefined> {
    return await this.userModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
  }
}
