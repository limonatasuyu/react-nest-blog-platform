import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule /*, getModelToken*/ } from '@nestjs/mongoose';
import mongoose, { connect, Connection } from 'mongoose';
import { Post, PostSchema } from '../schemes/post.schema';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';
import { User, UserSchema } from '../schemes/user.schema';
import { UserModule } from '../user/user.module';
import { PostsService } from './posts.service';
import { TagModule } from '../tag/tag.module';
import { ImageModule } from '../image/image.module';
import { generateRandomImages, generateRandomPosts } from './createMockData';
import { JwtModule } from '@nestjs/jwt';
import { InternalServerErrorException, ValidationError } from '@nestjs/common';
import { Tag } from '../schemes/tag.schema';
import { Comment } from '../schemes/comment.schema';
import { Image } from '../schemes/images.schema';

describe('PostsController', () => {
  let postsController: PostsController;
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

    postsController = postsModule.get<PostsController>(PostsController);
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

  describe('getPosts method', () => {
    it('should return the posts with ascending order by their createdAt value', async () => {
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: 50,
        commentCount: 100,
        tagCount: 10,
      });
      const expectedPosts = posts
        .sort((a, b) =>
          new Date(b.createdAt) > new Date(a.createdAt) ? 1 : -1,
        )
        .slice(0, 10);

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      const mapFunction = (i: Post) => ({
        title: i.title,
        content: i.content,
        thumbnailId: i.thumbnailId,
      });
      const result = await postsController.getPosts({ page: 1 });
      const mappedResult = result.posts.map(mapFunction);
      const mappedExpectedPosts = expectedPosts.map(mapFunction);

      expect(
        mappedResult.every((res) => {
          return mappedExpectedPosts.find(
            (ex) =>
              ex.title === res.title &&
              ex.content === res.content &&
              String(ex.thumbnailId ?? null) ===
                String(res.thumbnailId ?? null),
          );
        }),
      ).toBe(true);
      expect(result.totalPageCount).toBe(Math.ceil(posts.length * 0.1));
    });

    it('should return the posts with same tags with ascending order by their createdAt value', async () => {
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: 50,
        commentCount: 100,
        tagCount: 10,
      });
      const tag = tags[0];
      const tagName = tag.name;

      const filterFunction = (i) =>
        i.tags.find((x) => String(x) === String(tag._id));

      const expectedPosts = posts
        .sort((a, b) =>
          new Date(b.createdAt) < new Date(a.createdAt) ? 1 : -1,
        )
        .filter(filterFunction)
        .slice(0, 10);

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      const mapFunction = (i: Post) => ({
        title: i.title,
        content: i.content,
        thumbnailId: i.thumbnailId,
      });
      const result = await postsController.getPosts({ page: 1, tag: tagName });
      const mappedResult = result.posts.map(mapFunction);
      const mappedExpectedPosts = expectedPosts.map(mapFunction);

      mappedResult.forEach((res) => {
        const matchedPost = mappedExpectedPosts.find((ex) => {
          return ex.title === res.title;
        });

        expect(matchedPost).toBeDefined();

        expect(matchedPost.title).toBe(res.title);
        expect(matchedPost.content).toBe(res.content);
        expect(String(matchedPost.thumbnailId ?? null)).toBe(
          String(res.thumbnailId ?? null),
        );
      });

      expect(mappedResult.length).toBe(mappedExpectedPosts.length);

      expect(result.totalPageCount).toBe(
        Math.ceil(posts.filter(filterFunction).length * 0.1),
      );
    });

    it('should return the posts with same user with ascending order by their createdAt value', async () => {
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: 50,
        commentCount: 100,
        tagCount: 10,
      });
      const user = users[0];
      const username = user.username;
      const filterFunction = (i) => i.user === user._id;
      const expectedPosts = posts
        .filter(filterFunction)
        .sort((a, b) =>
          new Date(b.createdAt) > new Date(a.createdAt) ? 1 : -1,
        )
        .slice(0, 10);

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      const mapFunction = (i: Post) => ({
        title: i.title,
        content: i.content,
        thumbnailId: i.thumbnailId,
      });
      const result = await postsController.getPosts({ page: 1, username });
      const mappedResult = result.posts.map(mapFunction);
      const mappedExpectedPosts = expectedPosts.map(mapFunction);

      expect(
        mappedResult.every((res) => {
          return mappedExpectedPosts.find(
            (ex) =>
              ex.title === res.title &&
              ex.content === res.content &&
              String(ex.thumbnailId ?? null) ===
                String(res.thumbnailId ?? null),
          );
        }),
      ).toBe(true);
      expect(result.totalPageCount).toBe(
        Math.ceil(posts.filter(filterFunction).length * 0.1),
      );
    });

    it('should return an empty array and totalPageCount as 1 if there are no posts in db', async () => {
      const result = await postsController.getPosts({ page: 1 });
      expect(result.posts).toStrictEqual([]);
      expect(result.totalPageCount).toBe(1);
    });
  });
  describe('likePost method', () => {
    it('should mark post as liked if it is not liked by the user already, if it was, then it should mark it as unliked, if the post is liked, it should create a notification', async () => {
      const createNotification = jest.spyOn(
        NotificationService.prototype,
        'createNotification',
      );
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 5,
        postCount: 50,
        commentCount: 100,
        tagCount: 10,
      });
      const userId = users[4]._id;
      const post = posts[0];
      const postId = post._id;
      const likeCount = post.likedBy.length;
      const isUserLiked = !Boolean(
        post.likedBy.find((i) => String(i._id) === userId.toString()),
      );

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      await postsController.likePost({ user: { sub: userId } }, String(postId));

      const postAfterMethodCall = await mongoConnection
        .collection('posts')
        .findOne({ _id: postId });

      expect(postAfterMethodCall.likedBy.length).toBe(
        isUserLiked ? likeCount + 1 : likeCount - 1,
      );

      if (isUserLiked) {
        expect(createNotification).toBeCalledWith({
          createdBy: userId,
          createdFor: post.user,
          type: 'like',
          relatedPost: String(postId),
        });
      }
    });

    it('should throw an erro if given postId does not corresponds with a post in db', async () => {
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 5,
        postCount: 50,
        commentCount: 100,
        tagCount: 10,
      });
      const userId = users[4]._id;
      const postId = new mongoose.Types.ObjectId();

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      expect(
        postsController.likePost({ user: { sub: userId } }, String(postId)),
      ).rejects.toThrow(InternalServerErrorException);

      await Promise.all(
        posts.map(async (post) => {
          const postAfterMethodCall = await mongoConnection
            .collection('posts')
            .findOne({ _id: post._id });

          expect(postAfterMethodCall.likedBy.length).toBe(post.likedBy.length);
        }),
      );
    });

    it('should throw an error if not receives a postId', async () => {
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: 50,
        commentCount: 100,
        tagCount: 10,
      });
      const userId = users[0]._id;

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      expect(
        //@ts-expect-error testing the behaviour on absence of the postId
        postsController.likePost({ user: { sub: userId } }),
      ).rejects.toThrow(InternalServerErrorException);
      await Promise.all(
        posts.map(async (post) => {
          const postAfterMethodCall = await mongoConnection
            .collection('posts')
            .findOne({ _id: post._id });

          expect(postAfterMethodCall.likedBy.length).toBe(post.likedBy.length);
        }),
      );
    });
  });
  describe('savePost method', () => {
    it("should save the post in the user's savedPosts array", async () => {
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: 50,
        commentCount: 100,
        tagCount: 10,
      });
      const user = users[0];
      const savedPostsLengthBeforeUpdate = user.savedPosts.length;
      const userId = user._id;
      const postId = posts[0]._id;
      //@ts-expect-error savedPosts actually have ObjectIds instead of posts
      const isUserSaved = !Boolean(user.savedPosts.includes(postId));

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      await postsController.savePost({ user: { sub: userId } }, String(postId));

      const userAfterMethodCall = await mongoConnection
        .collection('users')
        .find({ _id: userId })
        .toArray();

      expect(userAfterMethodCall[0].savedPosts.length).toBe(
        isUserSaved
          ? savedPostsLengthBeforeUpdate + 1
          : savedPostsLengthBeforeUpdate - 1,
      );
    });

    it('should throw an error if the given postId does not corresponds with any post in the db', async () => {
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: 50,
        commentCount: 100,
        tagCount: 10,
      });
      const user = users[0];
      const savedPostsLengthBeforeUpdate = user.savedPosts.length;
      const userId = user._id;
      const postId = new mongoose.Types.ObjectId();

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      expect(
        postsController.savePost({ user: { sub: userId } }, String(postId)),
      ).rejects.toThrowError(InternalServerErrorException);

      const userAfterMethodCall = await mongoConnection
        .collection('users')
        .find({ _id: userId })
        .toArray();

      expect(userAfterMethodCall[0].savedPosts.length).toBe(
        savedPostsLengthBeforeUpdate,
      );
    });

    it('should throw an error if no postId were provided', async () => {
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: 50,
        commentCount: 100,
        tagCount: 10,
      });
      const user = users[0];
      const savedPostsLengthBeforeUpdate = user.savedPosts.length;
      const userId = user._id;

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      expect(
        //@ts-expect-error testing the behaviour on absence of the postId
        postsController.savePost({ user: { sub: userId } }),
      ).rejects.toThrowError(InternalServerErrorException);

      const userAfterMethodCall = await mongoConnection
        .collection('users')
        .find({ _id: userId })
        .toArray();

      expect(userAfterMethodCall[0].savedPosts.length).toBe(
        savedPostsLengthBeforeUpdate,
      );
    });
  });

  /*
   *describe('reportPost method', ()=>{})
   * */

  describe('createPost method', () => {
    it('should be able to create a post with no thumbnail', async () => {
      const initialPostCount = 50;
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: initialPostCount,
        commentCount: 100,
        tagCount: 10,
      });
      const user = users[0];
      const username = user.username;

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);

      await postsController.createPost(
        { user: { username } },
        {
          title: 'some title',
          content: 'some content',
          thumbnailId: undefined,
          tags: ['this', 'and', 'that'],
        },
      );

      const postsAfterMethodCall = await mongoConnection
        .collection('posts')
        .find();

      expect((await postsAfterMethodCall.toArray()).length).toEqual(
        initialPostCount + 1,
      );
    });

    it('should be able to create a post with thumbnail', async () => {
      const initialPostCount = 50;
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: initialPostCount,
        commentCount: 100,
        tagCount: 10,
      });
      const images = generateRandomImages({ users, imageCount: 100 });
      const user = users[0];
      const username = user.username;
      const imageId = images.find(
        (i) => String(i.user) === String(user._id),
      )._id;

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection.collection<Image>('images').insertMany(images);

      await postsController.createPost(
        { user: { username } },
        {
          title: 'some title',
          content: 'some content',
          thumbnailId: String(imageId),
          tags: ['this', 'and', 'that'],
        },
      );

      const postsAfterMethodCall = await mongoConnection
        .collection('posts')
        .find();

      expect((await postsAfterMethodCall.toArray()).length).toEqual(
        initialPostCount + 1,
      );
    });

    it('should throw an error if title, content, or tags is missing in the dto', async () => {
      const initialPostCount = 50;
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: initialPostCount,
        commentCount: 100,
        tagCount: 10,
      });
      const images = generateRandomImages({ users, imageCount: 30 });
      const user = users[0];
      const username = user.username;
      const imageId = images.find(
        (i) => String(i.user) === String(user._id),
      )._id;

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection.collection<Image>('images').insertMany(images);

      expect(
        postsController.createPost(
          { user: { username } },
          //@ts-expect-error testing the behaviour on absence of title
          {
            content: 'some content',
            thumbnailId: String(imageId),
            tags: ['this', 'and', 'that'],
          },
        ),
        //@ts-expect-error i need that
      ).rejects.toThrow(ValidationError);

      let postsAfterMethodCall = await mongoConnection
        .collection('posts')
        .find();

      expect((await postsAfterMethodCall.toArray()).length).toEqual(
        initialPostCount,
      );

      expect(
        postsController.createPost(
          { user: { username } },
          //@ts-expect-error testing the behaviour on absence of tags
          {
            title: 'some title',
            content: 'some content',
            thumbnailId: String(imageId),
          },
        ),
        //@ts-expect-error i need that
      ).rejects.toThrow(ValidationError);

      postsAfterMethodCall = await mongoConnection.collection('posts').find();

      expect((await postsAfterMethodCall.toArray()).length).toEqual(
        initialPostCount,
      );

      expect(
        postsController.createPost(
          { user: { username } },
          //@ts-expect-error testing the behaviour on absence of content
          {
            title: 'some title',
            thumbnailId: String(imageId),
            tags: ['this', 'and', 'that'],
          },
        ),
        //@ts-expect-error i need that
      ).rejects.toThrow(ValidationError);

      postsAfterMethodCall = await mongoConnection.collection('posts').find();

      expect((await postsAfterMethodCall.toArray()).length).toEqual(
        initialPostCount,
      );
    });

    it('should throw an error if given username does not corresponds with a user in the db', async () => {
      const initialPostCount = 50;
      const { users, comments, tags, posts } = generateRandomPosts({
        userCount: 10,
        postCount: initialPostCount,
        commentCount: 100,
        tagCount: 10,
      });
      const images = generateRandomImages({ users, imageCount: 30 });
      const username = 'some_username';

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);
      await mongoConnection.collection<Tag>('tags').insertMany(tags);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection.collection<Image>('images').insertMany(images);

      expect(
        postsController.createPost(
          { user: { username } },
          {
            title: 'some title',
            content: 'some content',
            tags: ['this', 'and', 'that'],
          },
        ),
      ).rejects.toThrow(InternalServerErrorException);

      const postsAfterMethodCall = await mongoConnection
        .collection('posts')
        .find();

      expect((await postsAfterMethodCall.toArray()).length).toEqual(
        initialPostCount,
      );
    });
  });

  describe('deletePost method', () => {
  
  
  })
});
