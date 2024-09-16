import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserController } from './user.controller';
import mongoose, { connect, Connection } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageModule } from '../image/image.module';
import { NotificationModule } from '../notification/notification.module';
import { User, UserSchema } from '../schemes/user.schema';
import { Image } from '../schemes/images.schema';
import { UsersService } from './user.service';
import { generateRandomUsers } from './createMockData';
import {
  ActivationCode,
  ActivationCodeSchema,
} from '../schemes/activationCode.schema';
import { JwtModule } from '@nestjs/jwt';
import {
  BadRequestException,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { compare } from 'bcrypt';
import { CreateUserDTO } from '../dto/user-dto';
import { generateRandomImages } from '../posts/createMockData';

describe('UserModuleController', () => {
  let userController: UserController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    userModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: ActivationCode.name, schema: ActivationCodeSchema },
        ]),
        JwtModule.registerAsync({
          global: true,
          useFactory: async () => ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60m' },
          }),
        }),
        ImageModule,
        NotificationModule,
      ],
      controllers: [UserController],
      providers: [UsersService],
    }).compile();

    userController = userModule.get<UserController>(UserController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
    await userModule.close();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('followUser method', () => {
    it('should make one user follow the other if the following one is not already following', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });

      const followingUserId = users[0]._id;
      const followedUser = users[1];
      followedUser.followers = [];

      const followedUsername = users[1].username;

      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await userController.followUser(
        { user: { sub: followingUserId } },
        followedUsername,
      );

      expect(result.message).toStrictEqual('Operation handled successfully.');

      const userAfterUpdate = await mongoConnection
        .collection('users')
        .findOne({ _id: followedUser._id });

      expect(userAfterUpdate.followers).toStrictEqual([followingUserId]);
    });

    it('should make one user unfollow the other if the unfollowing one is already following', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });

      const unfollowingUserId = users[0]._id;
      const followedUser = users[1];
      //@ts-expect-error i need that
      followedUser.followers = [unfollowingUserId];

      const followedUsername = users[1].username;

      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await userController.followUser(
        { user: { sub: unfollowingUserId } },
        followedUsername,
      );

      expect(result.message).toStrictEqual('Operation handled successfully.');

      const userAfterUpdate = await mongoConnection
        .collection('users')
        .findOne({ _id: followedUser._id });

      expect(userAfterUpdate.followers).toStrictEqual([]);
    });

    it('should throw error when following userId correlates with same user as the followedUserName', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const user = users[0];
      user.followers = [];
      await mongoConnection.collection<User>('users').insertMany(users);

      expect(
        userController.followUser({ user: { sub: user._id } }, user.username),
      ).rejects.toThrowError(InternalServerErrorException);

      const userAfterUpdate = await mongoConnection
        .collection('users')
        .findOne({ _id: user._id });

      expect(userAfterUpdate.followers).toStrictEqual([]);
    });

    it('should throw error if given username or userId not exists in db', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const user = users[0];
      user.followers = [];
      await mongoConnection.collection<User>('users').insertMany(users);

      expect(
        userController.followUser(
          { user: { sub: user._id } },
          'some non existing username',
        ),
      ).rejects.toThrowError(InternalServerErrorException);

      let userAfterUpdate = await mongoConnection
        .collection('users')
        .findOne({ _id: user._id });

      expect(userAfterUpdate.followers).toStrictEqual([]);

      expect(
        userController.followUser(
          { user: { sub: new mongoose.Types.ObjectId() } },
          user.username,
        ),
      ).rejects.toThrowError(InternalServerErrorException);

      userAfterUpdate = await mongoConnection
        .collection('users')
        .findOne({ _id: user._id });

      expect(userAfterUpdate.followers).toStrictEqual([]);
    });
  });

  describe('getUser method', () => {
    it('should return info about user, also give the info that is if searching user is following the querying user or not', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const searchingUser = users[0];
      const queriedUser = users[1];
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await userController.getUser(
        { user: { sub: String(searchingUser._id) } },
        queriedUser.username,
      );

      expect(result).toStrictEqual({
        username: queriedUser.username,
        firstname: queriedUser.firstname,
        lastname: queriedUser.lastname,
        description: queriedUser.description ?? null,
        email: queriedUser.email,
        profilePictureId: queriedUser.profilePictureId
          ? String(queriedUser.profilePictureId)
          : null,
        isUserFollowing: Boolean(
          queriedUser.followers.find(
            (i) => String(i) === String(searchingUser._id),
          ),
        ),
      });
    });

    it('should throw error if given username for the queried user does not exists in db', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const searchingUser = users[0];
      const queriedUserName = 'non existing username';
      await mongoConnection.collection<User>('users').insertMany(users);

      expect(
        userController.getUser(
          { user: { sub: String(searchingUser._id) } },
          queriedUserName,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    }, 6500);

    it('should throw error if given userId for searching user does not exists in db', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const searchingUserId = new mongoose.Types.ObjectId();
      const queriedUserName = users[0].username;
      await mongoConnection.collection<User>('users').insertMany(users);

      expect(
        userController.getUser(
          { user: { sub: String(searchingUserId) } },
          queriedUserName,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('create method', () => {
    it('should create a user with given credentials and false isActivated key', async () => {
      const initialUserCount = 10;
      const users = await generateRandomUsers({
        userCount: initialUserCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      const createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: 'username',
        email: 'email@email.email',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      const result = await userController.create(createdUser);

      expect(result.message).toStrictEqual('User created successfully.');
      expect(result.user_id).toBeDefined();

      const userInDB = await mongoConnection
        .collection('users')
        .findOne({ username: createdUser.username });

      expect({ ...userInDB, password: undefined }).toMatchObject({
        ...createdUser,
        firstname:
          createdUser.firstname[0].toUpperCase() +
          createdUser.firstname.slice(1),
        lastname:
          createdUser.lastname[0].toUpperCase() + createdUser.lastname.slice(1),
        password: undefined,
      });

      const isPasswordsMatch = await compare(
        createdUser.password,
        userInDB.password,
      );
      expect(isPasswordsMatch).toBe(true);
      expect(userInDB.isActivated).toBe(false);

      const usersAfterUpdate = await mongoConnection.collection('users').find();

      expect((await usersAfterUpdate.toArray()).length).toBe(
        initialUserCount + 1,
      );
    }, 15000);

    it('should throw error if given credentials have an empty value', async () => {
      const initialUserCount = 10;
      const users = await generateRandomUsers({
        userCount: initialUserCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      let createdUser = {
        firstname: '',
        lastname: 'lastname',
        username: 'username',
        email: 'email@email.email',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      let usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);

      createdUser = {
        firstname: 'firstname',
        lastname: '',
        username: 'username',
        email: 'email@email.email',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);

      createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: '',
        email: 'email@email.email',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);

      createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: 'username',
        email: '',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);

      createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: 'username',
        email: 'email@email.email',
        password: '',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);

      createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: 'username',
        email: 'email@email.email',
        password: 'somePassword',
      } as unknown as CreateUserDTO;

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);
    });

    it('should throw error if given credentials does not meet the requirements', async () => {
      const initialUserCount = 10;
      const users = await generateRandomUsers({
        userCount: initialUserCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      let createdUser = {
        firstname: 'fir',
        lastname: 'lastname',
        username: 'username',
        email: 'email@email.email',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      let usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);

      createdUser = {
        firstname: 'firstname',
        lastname: 'las',
        username: 'username',
        email: 'email@email.email',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);

      createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: 'use',
        email: 'email@email.email',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);

      createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: 'username',
        email: 'not an email',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);

      createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: 'username',
        email: 'email@email.email',
        password: 'pas',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );
      usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);
    });

    it('should throw an error if given username already exists in the db', async () => {
      const initialUserCount = 10;
      const users = await generateRandomUsers({
        userCount: initialUserCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      const createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: users[0].username,
        email: 'email@email.email',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );

      const usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);
    });

    it('should throw an error if given email already exists in the db', async () => {
      const initialUserCount = 10;
      const users = await generateRandomUsers({
        userCount: initialUserCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      const createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: 'username',
        email: users[0].email,
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        BadRequestException,
      );

      const usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);
    });

    it("should throw error if email couldn't be sent", async () => {
      const sendActivationEmail = jest.spyOn(
        UsersService.prototype as any,
        'sendActivationEmail',
      );
      sendActivationEmail.mockResolvedValue(false);

      const initialUserCount = 10;
      const users = await generateRandomUsers({
        userCount: initialUserCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      const createdUser = {
        firstname: 'firstname',
        lastname: 'lastname',
        username: 'username',
        email: 'email@email.email',
        password: 'somePassword',
        dateOfBirth: new Date('2000'),
      };

      await expect(userController.create(createdUser)).rejects.toThrow(
        InternalServerErrorException,
      );

      const usersAfterMethodCall = await mongoConnection
        .collection('users')
        .find()
        .toArray();
      expect(usersAfterMethodCall.length).toBe(initialUserCount);
    });
  });

  describe('activate method', () => {
    it('should activate the given user using the correct activation code', async () => {
      const initialUserCount = 10;

      const users = await generateRandomUsers({
        userCount: initialUserCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      const user = users.find((i) => !i.isActivated);

      const activationCode = {
        user_id: user._id,
        code: 123456,
        createdAt: new Date(),
        tryCount: 0,
      };
      await mongoConnection
        .collection('activationcodes')
        .insertOne(activationCode);

      const result = await userController.activate({
        user_id: user._id.toString(),
        activationCode: 123456,
      });

      const updatedUser = await mongoConnection
        .collection<User>('users')
        .findOne({ _id: user._id });

      expect(result).toEqual({ message: 'User activated successfully' });
      expect(updatedUser.isActivated).toBe(true);
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(
        userController.activate({
          user_id: new mongoose.Types.ObjectId().toString(),
          activationCode: 123456,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an error if no activation codes are found', async () => {
      const users = await generateRandomUsers({
        userCount: 1,
        postCount: 10,
      });
      const user = users[0];
      await mongoConnection.collection<User>('users').insertOne(user);

      await expect(
        userController.activate({
          user_id: user._id.toString(),
          activationCode: 123456,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an error if the activation code is incorrect', async () => {
      const users = await generateRandomUsers({
        userCount: 1,
        postCount: 10,
      });
      const user = users[0];
      await mongoConnection.collection<User>('users').insertOne(user);

      const activationCode = {
        user_id: user._id,
        code: 654321, // Incorrect code
        createdAt: new Date(),
        tryCount: 0,
      };
      await mongoConnection
        .collection('activationcodes')
        .insertOne(activationCode);

      await expect(
        userController.activate({
          user_id: user._id.toString(),
          activationCode: 123456, // This is the incorrect code
        }),
      ).rejects.toThrow(BadRequestException);

      const updatedActivationCode = await mongoConnection
        .collection('activationcodes')
        .findOne({ user_id: user._id });

      expect(updatedActivationCode.tryCount).toBe(1);
    });

    it('should throw an error if too many wrong attempts were made', async () => {
      const users = await generateRandomUsers({
        userCount: 1,
        postCount: 10,
      });
      const user = users[0];
      await mongoConnection.collection<User>('users').insertOne(user);

      const activationCode = {
        user_id: user._id,
        code: 123456,
        createdAt: new Date(),
        tryCount: 3,
      };
      await mongoConnection
        .collection('activationcodes')
        .insertOne(activationCode);

      await expect(
        userController.activate({
          user_id: user._id.toString(),
          activationCode: 123456,
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'Too many wrong queries made, please request a new code',
        ),
      );
    });

    it('should throw an error if the activation code has expired', async () => {
      const users = await generateRandomUsers({
        userCount: 1,
        postCount: 10,
      });
      const user = users[0];
      await mongoConnection.collection<User>('users').insertOne(user);

      const activationCode = {
        user_id: user._id,
        code: 123456,
        createdAt: new Date(Date.now() - 6 * 60 * 1000),
        tryCount: 0,
      };
      await mongoConnection
        .collection('activationcodes')
        .insertOne(activationCode);

      await expect(
        userController.activate({
          user_id: user._id.toString(),
          activationCode: 123456,
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'Too much time passed till code generated, please request a new code',
        ),
      );
    });
  });

  describe('createActivationCode method', () => {
    it('should create and send a new activation code if no recent code exists', async () => {
      const users = await generateRandomUsers({
        userCount: 1,
        postCount: 0,
      });
      const user = users[0];
      await mongoConnection.collection<User>('users').insertOne(user);

      await mongoConnection.collection('activationcodes').insertOne({
        user_id: user._id,
        code: 123456,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      });

      const sendActivationEmail = jest.spyOn(
        UsersService.prototype as any,
        'sendActivationEmail',
      );
      sendActivationEmail.mockResolvedValue(true);

      const result = await userController.recreateActivation({
        user_id: user._id.toString(),
      });

      const activationCode = await mongoConnection
        .collection('activationcodes')
        .findOne({ user_id: user._id });

      expect(activationCode).toBeDefined();
      expect(activationCode.code.toString()).toHaveLength(6);
      expect(result.message).toEqual(
        'Activation code created and sent to your email successfully.',
      );
    });

    it('should throw an error if the user does not exist', async () => {
      await expect(
        userController.recreateActivation({
          user_id: new mongoose.Types.ObjectId().toString(),
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw an error if there are no activation codes', async () => {
      const users = await generateRandomUsers({
        userCount: 1,
        postCount: 0,
      });
      const user = users[0];
      await mongoConnection.collection<User>('users').insertOne(user);

      // Ensure no activation codes exist for this user
      await mongoConnection.collection('activationcodes').deleteMany({
        user_id: user._id,
      });

      await expect(
        userController.recreateActivation({
          user_id: user._id.toString(),
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw a RequestTimeoutException if a recent code was created within the last 5 minutes', async () => {
      const users = await generateRandomUsers({
        userCount: 1,
        postCount: 0,
      });
      const user = users[0];
      await mongoConnection.collection<User>('users').insertOne(user);

      // Insert a recent activation code (created less than 5 minutes ago)
      await mongoConnection.collection('activationcodes').insertOne({
        user_id: user._id,
        code: 123456,
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      });

      await expect(
        userController.recreateActivation({
          user_id: user._id.toString(),
        }),
      ).rejects.toThrow(
        new RequestTimeoutException(
          'Please wait for 5 minutes before try to create a new code.',
        ),
      );
    });

    it('should throw an InternalServerErrorException if email fails to send', async () => {
      const users = await generateRandomUsers({
        userCount: 1,
        postCount: 0,
      });
      const user = users[0];
      await mongoConnection.collection<User>('users').insertOne(user);

      // Insert an old activation code
      await mongoConnection.collection('activationcodes').insertOne({
        user_id: user._id,
        code: 123456,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      });

      const sendActivationEmail = jest.spyOn(
        UsersService.prototype as any,
        'sendActivationEmail',
      );
      sendActivationEmail.mockResolvedValue(false);

      await expect(
        userController.recreateActivation({
          user_id: user._id.toString(),
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should ensure the activation code is a 6-digit number', async () => {
      const users = await generateRandomUsers({
        userCount: 1,
        postCount: 0,
      });
      const user = users[0];
      await mongoConnection.collection<User>('users').insertOne(user);

      await mongoConnection.collection('activationcodes').insertOne({
        user_id: user._id,
        code: 123456,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      });

      const sendActivationEmail = jest.spyOn(
        UsersService.prototype as any,
        'sendActivationEmail',
      );
      sendActivationEmail.mockResolvedValue(true);

      const result = await userController.recreateActivation({
        user_id: user._id.toString(),
      });

      const newActivationCode = await mongoConnection
        .collection('activationcodes')
        .findOne({ user_id: user._id });

      expect(String(newActivationCode.code)).toHaveLength(6);
      expect(result.message).toEqual(
        'Activation code created and sent to your email successfully.',
      );
    });
  });

  describe('changePicture method', () => {
    it("should change the user's profile picture", async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const images = generateRandomImages({ users, imageCount: 50 });

      const user = users.find((i) =>
        images.find((image) => String(image.user) === String(i._id)),
      );
      const image = images.find(
        (image) => String(image.user) === String(user._id) && !image.isRelated,
      );
      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Image>('images').insertMany(images);

      const result = await userController.changePicture(
        {
          user: { sub: String(user._id) },
        },
        { imageId: String(image._id) },
      );

      expect(result).toStrictEqual({
        message: 'Profile picture changed successfully.',
      });

      const userAfterUpdate = await mongoConnection
        .collection('users')
        .findOne({ _id: user._id });
      expect(String(userAfterUpdate.profilePictureId)).toBe(String(image._id));
    });

    it('should throw error if given imageId not exists in the db', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const images = generateRandomImages({ users, imageCount: 50 });

      const user = users.find((i) =>
        images.find((image) => String(image.user) === String(i._id)),
      );
      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Image>('images').insertMany(images);

      expect(
        userController.changePicture(
          {
            user: { sub: String(user._id) },
          },
          { imageId: String(new mongoose.Types.ObjectId()) },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if given userId not exists in the db', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const images = generateRandomImages({ users, imageCount: 50 });

      const image = images[0];
      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Image>('images').insertMany(images);

      expect(
        userController.changePicture(
          {
            user: { sub: String(new mongoose.Types.ObjectId()) },
          },
          { imageId: String(image._id) },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if given image is already related', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const images = generateRandomImages({ users, imageCount: 50 });

      let user;
      let image;

      for (const u of users) {
        const foundImage = images.find(
          (img) => String(img.user) === String(u._id) && img.isRelated,
        );

        if (foundImage) {
          user = u;
          image = foundImage;
          break;
        }
      }

      if (!image) {
        console.warn('No related image found, skipping test.');
        return;
      }

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Image>('images').insertMany(images);

      expect(
        userController.changePicture(
          {
            user: { sub: String(user._id) },
          },
          { imageId: String(image._id) },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if given image does not correlates with the given user in the db', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const images = generateRandomImages({ users, imageCount: 50 });

      const user = users.find((i) =>
        images.find((image) => String(image.user) === String(i._id)),
      );
      const image = images.find(
        (image) => String(image.user) !== String(user._id) && !image.isRelated,
      );
      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Image>('images').insertMany(images);

      expect(
        userController.changePicture(
          {
            user: { sub: String(user._id) },
          },
          { imageId: String(image._id) },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('changeDescription method', () => {
    it("should change the user's description", async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const user = users[0];
      await mongoConnection.collection<User>('users').insertMany(users);

      const newDescription = 'some description about user';
      const result = await userController.changeDescription(
        { user: { sub: String(user._id) } },
        { description: newDescription },
      );

      expect(result).toStrictEqual({
        message: 'Description changed successully.',
      });

      const userAfterUpdate = await mongoConnection
        .collection('users')
        .findOne({ _id: user._id });
      expect(userAfterUpdate.description).toBe(newDescription);
    });

    it('should throw error if given user does not exists in the db', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      await mongoConnection.collection<User>('users').insertMany(users);

      const newDescription = 'some description about user';
      expect(
        userController.changeDescription(
          { user: { sub: String(new mongoose.Types.ObjectId()) } },
          { description: newDescription },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
