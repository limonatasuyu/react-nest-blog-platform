import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose, { connect, Connection } from 'mongoose';
import { Post, PostSchema } from '../schemes/post.schema';
import { NotificationModule } from '../notification/notification.module';
import { User, UserSchema } from '../schemes/user.schema';
import { UserModule } from '../user/user.module';
import { PostsService } from './posts.service';
import { TagModule } from '../tag/tag.module';
import { ImageModule } from '../image/image.module';
import { generateRandomImages, generateRandomPosts } from './createMockData';
import { JwtModule } from '@nestjs/jwt';
import { Tag } from '../schemes/tag.schema';
import { Comment } from '../schemes/comment.schema';

describe('PostsService', () => {
  let postsService: PostsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let postsModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    postsModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        MongooseModule.forFeature([
          { name: Post.name, schema: PostSchema },
          { name: User.name, schema: UserSchema },
        ]),
        UserModule,
        ImageModule,
        TagModule,
        NotificationModule,
        JwtModule.registerAsync({
          global: true,
          useFactory: async () => ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60m' },
          }),
        }),
      ],
      controllers: [PostsController],
      providers: [PostsService],
    }).compile();

    postsService = postsModule.get<PostsService>(PostsService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
    await postsModule.close();
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
  describe('getSearchResults method', () => {
    it('should return paginated search results', async () => {
      const postCount = 100;
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        commentCount: 20,
        tagCount: 10,
        postCount,
      });
      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      const page = 1;
      const keyword = posts[0].title;
      const result = await postsService.getSearchResults(page, keyword);

      expect(result.posts.length).toBeGreaterThanOrEqual(1);
      expect(result.posts.length).toBeLessThanOrEqual(10);
      expect(result.posts[0].title).toContain(posts[0].title);
      expect(result.totalPageCount).toBeLessThanOrEqual(
        Math.ceil(postCount * 0.1),
      );
    });

    it('should return no results for a non-matching keyword', async () => {
      const postCount = 100;
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        commentCount: 20,
        tagCount: 10,
        postCount,
      });
      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      const result = await postsService.getSearchResults(
        1,
        String(new mongoose.Types.ObjectId()),
      );

      expect(result.posts.length).toBe(0);
      expect(result.totalPageCount).toBeLessThanOrEqual(
        Math.ceil(postCount * 0.1),
      );
    });

    it('should handle an empty database gracefully', async () => {
      const result = await postsService.getSearchResults(1, 'any keyword');

      expect(result.posts.length).toBe(0);
      expect(result.totalPageCount).toBe(1);
    });

    it('should handle non-existent page number', async () => {
      const postCount = 100;
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        commentCount: 20,
        tagCount: 10,
        postCount,
      });
      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      const result = await postsService.getSearchResults(30, 'Post');

      expect(result.posts.length).toBe(0);
      expect(result.totalPageCount).toBeLessThanOrEqual(
        Math.ceil(postCount * 0.1),
      );
    });

    it('should handle partial keyword matches', async () => {
      const postCount = 100;
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        commentCount: 20,
        tagCount: 10,
        postCount,
      });
      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      const postTitle = posts[0].title;
      const result = await postsService.getSearchResults(
        1,
        postTitle.slice(0, 4),
      );

      expect(result.posts.length).toBeGreaterThanOrEqual(1);
      expect(result.posts[0].title).toBe(postTitle);
    });

    it('should return results for an empty keyword', async () => {
      const postCount = 100;
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        commentCount: 20,
        tagCount: 10,
        postCount,
      });
      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      const result = await postsService.getSearchResults(1, '');

      expect(result.posts.length).toBe(0);
      expect(result.totalPageCount).toBe(1);
    });
  });

  describe('getPostByIdAndUser method', () => {
    it('should return the post by id and user', async () => {
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        commentCount: 20,
        tagCount: 10,
        postCount: 100,
      });

      const userId = users.find((i) =>
        posts.find((x) => String(x.user) === String(i._id)),
      )._id;
      const post = posts.find((i) => String(i.user) === String(userId));
      const postId = post._id;
      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      const result = await postsService.getPostByIdAndUser(
        String(postId),
        String(userId),
      );

      expect(result.title).toBe(post.title);
      expect(result.content).toBe(post.content);
      expect(String(result.thumbnailId ?? null)).toStrictEqual(
        String(result.thumbnailId ?? null),
      );
      expect(result.tags).toStrictEqual(post.tags);
    });
  });
});
