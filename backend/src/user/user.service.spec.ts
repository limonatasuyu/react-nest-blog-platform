import { TestingModule, Test } from '@nestjs/testing';
import { TagService } from '../tag/tag.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, connect } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemes/user.schema';
import {
  ActivationCode,
  ActivationCodeSchema,
} from '../schemes/activationCode.schema';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ImageModule } from '../image/image.module';
import { NotificationModule } from '../notification/notification.module';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { generateRandomUsers } from './createMockData';

describe('UsersService', () => {
  let service: UsersService;
  let mongod: MongoMemoryServer;
  let usersModule: TestingModule;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    usersModule = await Test.createTestingModule({
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

    service = usersModule.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
    await usersModule.close();
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
  /*
  describe('findOne method', () => {
    it('should return the user if a valid username is given', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const user = users[0];
      const username = user.username;
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await service.findOne(username);
      const userFromDB = await mongoConnection
        .collection('users')
        .findOne({ _id: user._id });

      expect({
        ...result,
      }).toMatchObject({
        ...userFromDB,
        profilePictureId: userFromDB.profilePictureId
          ? String(userFromDB.profilePictureId)
          : null,
      });
    });

    it('should return the user if a valid email is given', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const user = users[0];
      const email = user.email;
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await service.findOne(email);
      const userFromDB = await mongoConnection
        .collection('users')
        .findOne({ _id: user._id });

      expect({
        ...result,
      }).toMatchObject({
        ...userFromDB,
        profilePictureId: userFromDB.profilePictureId
          ? String(userFromDB.profilePictureId)
          : null,
      });
    });

    it('should return null if no valid email or username is given', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await service.findOne('some non existing value');

      expect(result).toBeNull();
    });
  });

  describe('findById method', () => {
    it('should return a user by its id', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const user = users[0];
      const userId = user._id;
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await service.findById(String(userId));
      const userFromDB = await mongoConnection
        .collection('users')
        .findOne({ _id: userId });

      expect({
        ...result,
      }).toMatchObject({
        ...userFromDB,
        profilePictureId: userFromDB.profilePictureId
          ? String(userFromDB.profilePictureId)
          : null,
      });
    });

    it('should return null if no user exists by the given id', async () => {
      const users = await generateRandomUsers({ userCount: 10, postCount: 10 });
      const userId = new mongoose.Types.ObjectId();
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await service.findById(String(userId));
      expect(result).toBeNull();
    });
  });
*/
  describe('getSearchResults method', () => {
    /*
    it('should return paginated search results', async () => {
      const userCount = 30;
      const users = await generateRandomUsers({
        userCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      const page = 1;
      const keyword = users[0].firstname;
      const result = await service.getSearchResults(page, keyword);

      expect(result.users.length).toBeGreaterThanOrEqual(1);
      expect(result.users[0].username).toBe(users[0].username);
      expect(result.totalPageCount).toBeLessThanOrEqual(
        Math.ceil(userCount * 0.1),
      );
    });

    it('should return no results for a non-matching keyword', async () => {
      const userCount = 30;
      const users = await generateRandomUsers({
        userCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await service.getSearchResults(
        1,
        String(new mongoose.Types.ObjectId()),
      );

      expect(result.users.length).toBe(0);

      expect(result.totalPageCount).toBeLessThanOrEqual(
        Math.ceil(userCount * 0.1),
      );
    });

    it('should handle an empty database gracefully', async () => {
      const result = await service.getSearchResults(1, 'any keyword');

      expect(result.users.length).toBe(0);
      expect(result.totalPageCount).toBe(1);
    });

    it('should handle non-existent page number', async () => {
      const userCount = 30;
      const users = await generateRandomUsers({
        userCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      const result = await service.getSearchResults(30, 'Post');

      expect(result.users.length).toBe(0);
      expect(result.totalPageCount).toBeLessThanOrEqual(
        Math.ceil(userCount * 0.1),
      );
    });
*/
    it('should handle partial keyword matches', async () => {
      const userCount = 30;
      const users = await generateRandomUsers({
        userCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);

      const firstname = users[0].firstname;

      const result = await service.getSearchResults(1, firstname.slice(0, 5));

      expect(result.users.length).toBeGreaterThanOrEqual(1);
      expect(result.users[0].firstname).toBe(firstname);
    });
    /*
    it('should return results for an empty keyword', async () => {
      const userCount = 30;
      const users = await generateRandomUsers({
        userCount,
        postCount: 10,
      });
      await mongoConnection.collection<User>('users').insertMany(users);
      const result = await service.getSearchResults(1, '');

      expect(result.users.length).toBe(0);
      expect(result.totalPageCount).toBe(1);
    });
*/
  });
});
