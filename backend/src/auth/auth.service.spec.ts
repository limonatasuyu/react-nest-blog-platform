import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { connect, Connection } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemes/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { generateRandomUsers } from '../user/createMockData';

describe('AuthService', () => {
  let service: AuthService;
  let mongod: MongoMemoryServer;
  let authModule: TestingModule;
  let mongoConnection: Connection;

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

    service = authModule.get<AuthService>(AuthService);
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

  describe('verifyChangePasswordToken method', () => {
    it('should return the user if the token is valid and password matches', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });

      const user = users[0];
      const token = service['jwtService'].sign({
        sub: user._id.toString(),
        passwordHash: user.password,
      });

      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await service['verifyChangePasswordToken'](token);

      expect(String(result._id)).toStrictEqual(user._id.toString());
    });
    it('should throw UnauthorizedException if the token is invalid', async () => {
      await expect(
        service['verifyChangePasswordToken']('invalidToken'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the user does not exist', async () => {
      const token = service['jwtService'].sign({
        sub: new mongoose.Types.ObjectId().toString(),
        passwordHash: 'someHash',
      });

      await expect(service['verifyChangePasswordToken'](token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if the password does not match', async () => {
      const user = await mongoConnection.collection('users').insertOne({
        _id: new mongoose.Types.ObjectId(),
        email: 'test@example.com',
        password: await bcrypt.hash('correctPassword', 10),
      });

      const token = service['jwtService'].sign({
        sub: user.insertedId.toString(),
        passwordHash: await bcrypt.hash('wrongPassword', 10),
      });

      await expect(service['verifyChangePasswordToken'](token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
