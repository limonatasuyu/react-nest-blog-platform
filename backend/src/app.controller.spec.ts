import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import { PostsModule } from './posts/posts.module';
import { PostsService } from './posts/posts.service';
import { UserModule } from './user/user.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection } from 'mongoose';
import { generateRandomUsers } from './user/createMockData';
import { generateRandomTags } from './tag/createMockData';
import { User, UserSchema } from './schemes/user.schema';
import { Tag, TagSchema } from './schemes/tag.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './user/user.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let appModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    appModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Tag.name, schema: TagSchema },
        ]),
        JwtModule.registerAsync({
          global: true,
          useFactory: async () => ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60m' },
          }),
        }),
        TagModule,
        PostsModule,
        UserModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = appModule.get<AppController>(AppController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
    await appModule.close();
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

  describe('getRecommended method', () => {
    it('should return at most 3 tags with the most postCount and at most 3 users with the most postCount', async () => {
      const users = await generateRandomUsers({
        userCount: 30,
        postCount: 30,
      });
      const tags = generateRandomTags(100);

      const expectedTags = tags
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 3);
      const expectedUsers = users
        .sort((a, b) => a.posts.length - b.posts.length)
        .slice(0, 3)
        .map((i) => ({
          username: i.username,
          firstname: i.firstname,
          lastname: i.lastname,
          profilePictureId: i.profilePictureId ?? null,
          description: i.description,
        }));

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);

      const result = await appController.getRecommended();

      expect(Object.keys(result)).toStrictEqual(['tags', 'users']);
      expect(result.users).toStrictEqual(expectedUsers);
      expect(result.tags.every((i, x) => i.name === expectedTags[x].name)).toBe(
        true,
      );
    });

    it('should return appropriate object if there are no tags or users', async () => {
      const result = await appController.getRecommended();

      expect(Object.keys(result)).toStrictEqual(['tags', 'users']);
      expect(result.users).toStrictEqual([]);
      expect(result.tags).toStrictEqual([]);
    });
  });

  describe('getSearchResults method', () => {
    it('should trigger getSearchResults method in postsService and getSearchResults method in usersService', async () => {
      const getPosts = jest.spyOn(PostsService.prototype, 'getSearchResults');
      const getUsers = jest.spyOn(UsersService.prototype, 'getSearchResults');

      const arg = { page: 1, keyword: 'whateva' };
      const result = await appController.getSearchResults(arg);

      expect(getPosts).toBeCalledWith(arg.page, arg.keyword);
      expect(getUsers).toBeCalledWith(arg.page, arg.keyword);
      expect(Object.keys(result)).toStrictEqual(['postsData', 'usersData']);
    });

    it('should throw error if getSearchResults method from postsService returns null', async () => {
      const getPosts = jest.spyOn(PostsService.prototype, 'getSearchResults');

      getPosts.mockResolvedValueOnce(null);

      expect(
        appController.getSearchResults({ page: 1, keyword: 'whateva' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if getSearchResults method from usersService returns null', async () => {
      const getUsers = jest.spyOn(UsersService.prototype, 'getSearchResults');

      getUsers.mockResolvedValueOnce(null);

      expect(
        appController.getSearchResults({ page: 1, keyword: 'whateva' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if any of the getSearchResults methods returns null', async () => {
      const getPosts = jest.spyOn(PostsService.prototype, 'getSearchResults');
      const getUsers = jest.spyOn(UsersService.prototype, 'getSearchResults');

      getPosts.mockResolvedValueOnce(null);
      getUsers.mockResolvedValueOnce(null);

      expect(
        appController.getSearchResults({ page: 1, keyword: 'whateva' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
