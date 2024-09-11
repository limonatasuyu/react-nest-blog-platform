import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose, { connect, Connection } from 'mongoose';
import { Comment, CommentSchema } from '../schemes/comment.schema';
import { Post, PostSchema } from '../schemes/post.schema';
import { NotificationModule } from '../notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import { generateRandomComments } from './createMockData';
import { User, UserSchema } from '../schemes/user.schema';
import { UserModule } from '../user/user.module';

describe('CommentsService', () => {
  let service: CommentsService;
  let mongod: MongoMemoryServer;
  let commentsModule: TestingModule;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    commentsModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        MongooseModule.forFeature([
          { name: Comment.name, schema: CommentSchema },
          { name: Post.name, schema: PostSchema },
          { name: User.name, schema: UserSchema },
        ]),
        NotificationModule,
        JwtModule.registerAsync({
          global: true,
          useFactory: async () => ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60m' },
          }),
        }),
        UserModule,
      ],
      controllers: [CommentsController],
      providers: [CommentsService],
    }).compile();

    service = commentsModule.get<CommentsService>(CommentsService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
    await commentsModule.close();
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

  it('should find a comment by commentId and userId', async () => {
    const { users, posts, comments } = generateRandomComments({
      userCount: 10,
      postCount: 2,
      commentCount: 100,
    });
    const comment = comments[0];
    const commentId = comment._id;
    const userId = comments[0].user._id;
    //@ts-expect-error i need this
    comment.user = comment.user._id;
    //@ts-expect-error i need that too
    comment.answers = comment.answers.map((i) => i._id);
    //@ts-expect-error this too
    comment.answerTo = comment.answerTo ? comment.answerTo._id : null;

    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('users').insertMany(users);
    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('posts').insertMany(posts);
    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('comments').insertMany(comments);

    const result = await service.findCommentByCommentIdAndUserId(
      String(commentId),
      String(userId),
    );

    expect(JSON.stringify(result)).toEqual(JSON.stringify(comment));
  });

  it('should return null if commentId and userId not corresponds to each other', async () => {
    const { users, posts, comments } = generateRandomComments({
      userCount: 10,
      postCount: 2,
      commentCount: 100,
    });
    const comment = comments[0];
    const commentId = comment._id;
    const userId = users.find((i) => i._id !== comment.user._id)._id;

    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('users').insertMany(users);
    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('posts').insertMany(posts);
    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('comments').insertMany(comments);

    const result = await service.findCommentByCommentIdAndUserId(
      String(commentId),
      String(userId),
    );

    expect(result).toBeNull();
  });

  it('should return null if commentId is not corresponds to any comment in  the db', async () => {
    const { users, posts, comments } = generateRandomComments({
      userCount: 10,
      postCount: 2,
      commentCount: 100,
    });
    const commentId = new mongoose.Types.ObjectId();
    const userId = users[0]._id;

    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('users').insertMany(users);
    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('posts').insertMany(posts);
    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('comments').insertMany(comments);

    const result = await service.findCommentByCommentIdAndUserId(
      String(commentId),
      String(userId),
    );

    expect(result).toBeNull();
  });

  it('should return null if userId is not corresponds to any user in  the db', async () => {
    const { users, posts, comments } = generateRandomComments({
      userCount: 10,
      postCount: 2,
      commentCount: 100,
    });
    const commentId = comments[0]._id;
    const userId = new mongoose.Types.ObjectId();

    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('users').insertMany(users);
    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('posts').insertMany(posts);
    //@ts-expect-error i did not understand the error
    await mongoConnection.collection('comments').insertMany(comments);

    const result = await service.findCommentByCommentIdAndUserId(
      String(commentId),
      String(userId),
    );

    expect(result).toBeNull();
  });
});
