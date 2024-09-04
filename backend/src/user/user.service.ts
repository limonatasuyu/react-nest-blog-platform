import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { User, UserDocument } from '../schemes/user.schema';
import { ActivationCode } from '../schemes/activationCode.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
//import { ObjectId } from 'bson';
import {
  ActivateUserDTO,
  CreateUserDTO,
  CreateActivationCodeDTO,
} from '../dto/user-dto';
import { readFile } from 'node:fs/promises';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { ImageService } from 'src/image/image.service';
import { NotificationService } from 'src/notification/notification.service';

let blocklist;

interface UserWithFollowStatus extends UserDocument {
  isUserFollowing: boolean;
}

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
    private imageService: ImageService,
    private notificationService: NotificationService,
  ) {}

  async activate(dto: ActivateUserDTO) {
    const user = await this.userModel.findOne({
      _id: dto.user_id,
    });

    if (!user) {
      throw new InternalServerErrorException();
    }

    const activationCodes = await this.activationCodeModel.find({
      user_id: new mongoose.Types.ObjectId(dto.user_id as any),
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
      throw new BadRequestException(
        'Too many wrong queries made, please request a new code',
      );
    }

    const fiveMinutesInMs = 5 * 60 * 1000;
    if (
      Math.abs(
        new Date().getTime() - new Date(codeToCheck.createdAt).getTime(),
      ) >= fiveMinutesInMs
    ) {
      throw new BadRequestException(
        'Too much time passed till code generated, please request a new code',
      );
    }

    if (Number(dto.activationCode) !== Number(codeToCheck.code)) {
      await this.activationCodeModel.updateOne(
        { user_id: dto.user_id },
        { tryCount: codeToCheck.tryCount + 1 },
      );

      throw new BadRequestException('Code is incorrect.');
    }

    await this.userModel.updateOne({ _id: dto.user_id }, { isActivated: true });

    return { message: 'User activated successfully' };
  }

  async create(dto: CreateUserDTO): Promise<any> {
    const { username, email, password } = dto;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || (await isDisposable(email))) {
      throw new BadRequestException('Email address is not valid.');
    }

    const existingEmail = await this.userModel.findOne({ email }).exec();

    if (existingEmail) {
      throw new BadRequestException('Email address already in use');
    }

    const existingUsername = await this.userModel.findOne({ username }).exec();

    if (existingUsername) {
      throw new BadRequestException('Username is already in use');
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
      firstname: dto.firstname[0].toUpperCase() + dto.firstname.slice(1),
      lastname: dto.lastname[0].toUpperCase() + dto.lastname.slice(1),
      password: encryptedPassword,
      isActivated: false,
      _id: new mongoose.Types.ObjectId(),
      posts: [],
      followers: [],
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
      throw new RequestTimeoutException(
        'Please wait for 5 minutes before try to create a new code.',
      );
    }

    let activationCode;
    do {
      activationCode = Math.floor(Math.random() * 1000000);
    } while (String(activationCode).length !== 6);

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
    return {
      message: 'Activation code created and sent to your email successfully.',
    };
  }

  async findOne(usernameOrEmail: string): Promise<User | undefined> {
    return await this.userModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
  }

  async findById(userId: string): Promise<User | undefined> {
    return await this.userModel.findById(new mongoose.Types.ObjectId(userId));
  }

  async getById(user_id: string) {
    const user = await this.userModel.findById(
      new mongoose.Types.ObjectId(user_id),
    );
    if (!user) {
      throw new InternalServerErrorException();
    }
    return {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      profilePictureId: user.profilePictureId,
    };
  }

  async changeProfilePicture(pictureId: string, userId: string) {
    const image = await this.imageService.getImageWithId(pictureId);
    if (!image) throw new InternalServerErrorException();
    const updatedUser = await this.userModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { profilePictureId: pictureId },
    );
    if (!updatedUser) throw new InternalServerErrorException();

    await this.imageService.relateImage(pictureId);

    return { message: 'Profile picture changed successfully.' };
  }

  async changeDescription(description: string, userId: string) {
    const updatedUser = await this.userModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { description } },
    );

    if (!updatedUser || !updatedUser.acknowledged) {
      throw new InternalServerErrorException();
    }

    return { message: 'Description changed successully.' };
  }

  async getRecommendedUsers() {
    const tags = await this.userModel.aggregate([
      { $addFields: { postcount: { $size: { $ifNull: ['$posts', []] } } } },
      { $sort: { postcount: 1 } },
      { $limit: 3 },
      {
        $project: {
          _id: 0,
          firstname: 1,
          lastname: 1,
          username: 1,
          description: 1,
          profilePictureId: 1,
        },
      },
    ]);

    if (!tags) {
      throw new InternalServerErrorException();
    }
    return tags;
  }

  async follow(userToFollowUsername: string, followingUserId: string) {
    const updatedUser =
      await this.userModel.findOneAndUpdate<UserWithFollowStatus>(
        { username: userToFollowUsername },
        [
          {
            $set: {
              followers: {
                $cond: {
                  if: { $in: [followingUserId, '$followers'] },
                  then: {
                    $filter: {
                      input: '$followers',
                      as: 'follower',
                      cond: { $ne: ['$$follower', followingUserId] },
                    },
                  },
                  else: { $concatArrays: ['$followers', [followingUserId]] },
                },
              },
            },
          },
        ],
        {
          projection: {
            _id: 1,
            isUserFollowing: { $in: [followingUserId, '$followers'] },
          },
          new: true,
        },
      );

    if (!updatedUser) {
      throw new InternalServerErrorException();
    }

    if ((updatedUser.toObject() as any).isUserFollowing) {
      await this.notificationService.createNotification({
        type: 'follow',
        createdBy: followingUserId,
        createdFor: String(updatedUser._id),
      });
    }

    return { message: 'operation handled successfully' };
  }

  async getSearchResults(page: number, keyword: string) {
    const pageSize = 10;
    const users = await this.userModel.aggregate([
      { $match: { $text: { $search: keyword } } },
      {
        $facet: {
          users: [
            {
              $project: {
                _id: 0,
                firstname: 1,
                lastname: 1,
                username: 1,
                description: 1,
                profilePictureId: 1,
              },
            },
            { $sort: { score: { $meta: 'textScore' } } },
            {
              $skip: (page - 1) * pageSize,
            },
            {
              $limit: pageSize,
            },
          ],
          totalRecordCount: [{ $count: 'count' }],
        },
      },
      {
        $addFields: {
          totalPageCount: {
            $ceil: {
              $divide: [
                { $arrayElemAt: ['$totalRecordCount.count', 0] },
                pageSize,
              ],
            },
          },
        },
      },
    ]);

    return users[0] ?? [];
  }
}
