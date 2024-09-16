import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, connect } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../schemes/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { generateRandomUsers } from '../user/createMockData';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { generateRandomImages } from '../posts/createMockData';
import { compare } from 'bcrypt';

describe('AuthController', () => {
  let authController: AuthController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let authModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    authModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.registerAsync({
          global: true,
          useFactory: async () => ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60m' },
          }),
        }),
        UserModule,
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = authModule.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
    await authModule.close();
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
  describe('login Method', () => {
    it('should return the access_token if given username and password matches a user in the db', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const username = users[0].username;
      //@ts-expect-error passwordNotEncryped key added for testing;
      const password = users[0].passwordNotEncryped;
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await authController.login({ username, password });

      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.message).toBe('Login successfull.');
    });

    it('should return the access_token if given email and password matches a user in the db', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const email = users[0].email;
      //@ts-expect-error passwordNotEncryped key added for testing;
      const password = users[0].passwordNotEncryped;
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await authController.login({ email, password });

      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.message).toBe('Login successfull.');
    });

    it('should throw error if given username and email does not match', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const username = users[0].username;
      //@ts-expect-error passwordNotEncrypted key added for testing;
      const password = users[1].passwordNotEncryped;

      await mongoConnection.collection<User>('users').insertMany(users);
      await expect(
        authController.login({ username, password }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if given email does not correlates with a user in db', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const email = 'non existing email';
      //@ts-expect-error passwordNotEncrypted key added for testing;
      const password = users[0].passwordNotEncryped;

      await mongoConnection.collection<User>('users').insertMany(users);
      await expect(authController.login({ email, password })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if given username does not correlates with a user in db', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const username = 'non existing username';
      //@ts-expect-error passwordNotEncrypted key added for testing;
      const password = users[0].passwordNotEncryped;

      await mongoConnection.collection<User>('users').insertMany(users);
      await expect(
        authController.login({ username, password }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if given password is an empty string', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const username = users[0].username;
      const password = '';

      await mongoConnection.collection<User>('users').insertMany(users);
      await expect(
        authController.login({ username, password }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile method', () => {
    it('should return data about user', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });
      const images = generateRandomImages({ users, imageCount: 10 });
      const user = users.find((user) => {
        const image = images.find((i) => String(i.user) === String(user._id));
        if (user.profilePictureId && image) {
          user.profilePictureId = String(image._id.toString());
        }
        return true;
      });
      const userId = user._id;
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await authController.getProfile({ user: { sub: userId } });
      expect(result).toStrictEqual({
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        profilePictureId: user.profilePictureId ? String(user.profilePictureId) : null,
      });
    });

    it('should throw error if given userId does not corresponds with a user in the db', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const userId = new mongoose.Types.ObjectId();
      await mongoConnection.collection<User>('users').insertMany(users);

      expect(
        authController.getProfile({ user: { sub: userId } }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getChangePasswordToken method', () => {
    it('should give the token if password and userId matches and password not changed in last month', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const user = users[0];
      user.passwordLastUpdatedAt = new Date(0);
      const userId = user._id;
      //@ts-expect-error passwordNotEncrypted key added for testing;
      const password = users[0].passwordNotEncryped;
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await authController.getChangePasswordToken(
        { user: { sub: userId } },
        { password },
      );

      expect(result.token).toBeDefined();
    });

    it('should throw errot if password changed in last month', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const user = users[0];
      user.passwordLastUpdatedAt = new Date();
      const userId = user._id;
      //@ts-expect-error passwordNotEncrypted key added for testing;
      const password = users[0].passwordNotEncryped;
      await mongoConnection.collection<User>('users').insertMany(users);

      await expect(
        authController.getChangePasswordToken(
          { user: { sub: userId } },
          { password },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if userId and password does not matches', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const user = users[0];
      user.passwordLastUpdatedAt = new Date(0);
      const userId = user._id;
      const password = 'wrong password';
      await mongoConnection.collection<User>('users').insertMany(users);

      await expect(
        authController.getChangePasswordToken(
          { user: { sub: userId } },
          { password },
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if given userId does not match any user in the db', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const userId = new mongoose.Types.ObjectId();
      const password = 'some password';
      await mongoConnection.collection<User>('users').insertMany(users);

      await expect(
        authController.getChangePasswordToken(
          { user: { sub: userId } },
          { password },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword method', () => {
    it('should take the token and change the password', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const user = users[0];
      const userId = user._id;
      const verifyToken = jest.spyOn(
        AuthService.prototype as any,
        'verifyChangePasswordToken',
      );
      verifyToken.mockResolvedValue(user);

      await mongoConnection.collection<User>('users').insertMany(users);

      const newPassword = 'new password';
      const token = new mongoose.Types.ObjectId();

      const result = await authController.changePassword(
        {
          user: { sub: userId },
        },
        { newPassword, newPasswordAgain: newPassword, token },
      );

      expect(result).toStrictEqual({
        message: 'Password changed succesfully.',
      });
    });

    it('should throw error if token verification fails', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const user = users[0];
      const userId = user._id;
      const verifyToken = jest.spyOn(
        AuthService.prototype as any,
        'verifyChangePasswordToken',
      );
      verifyToken.mockRejectedValueOnce(
        new UnauthorizedException('Token verification failed.'),
      );

      await mongoConnection.collection<User>('users').insertMany(users);

      const newPassword = 'new password';
      const token = new mongoose.Types.ObjectId();

      await expect(
        authController.changePassword(
          {
            user: { sub: userId },
          },
          { newPassword, newPasswordAgain: newPassword, token },
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if given userId does not correlates with a user in the db', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const userId = new mongoose.Types.ObjectId();
      await mongoConnection.collection<User>('users').insertMany(users);

      const newPassword = 'new password';
      const token = new mongoose.Types.ObjectId();

      await expect(
        authController.changePassword(
          {
            user: { sub: userId },
          },
          { newPassword, newPasswordAgain: newPassword, token },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('Change password integration', () => {
    it('should change the password', async () => {
      const users = await generateRandomUsers({
        userCount: 10,
        postCount: 10,
      });

      const user = users[0];
      user.passwordLastUpdatedAt = new Date(0);
      const userId = user._id;
      //@ts-expect-error passwordNotEncrypted key added for testing;
      const password = users[0].passwordNotEncryped;
      await mongoConnection.collection<User>('users').insertMany(users);

      const getTokenResult = await authController.getChangePasswordToken(
        { user: { sub: userId } },
        { password },
      );

      expect(getTokenResult.token).toBeDefined();

      const newPassword = 'new password';
      const token = getTokenResult.token;

      const result = await authController.changePassword(
        {
          user: { sub: userId },
        },
        { newPassword, newPasswordAgain: newPassword, token },
      );

      expect(result).toStrictEqual({
        message: 'Password changed succesfully.',
      });

      const userAfterUpdate = await mongoConnection
        .collection('users')
        .findOne({ _id: user._id });

      const isPasswordsMatch = await compare(
        newPassword,
        userAfterUpdate.password,
      );

      expect(isPasswordsMatch).toBe(true);
    });
  });
});
