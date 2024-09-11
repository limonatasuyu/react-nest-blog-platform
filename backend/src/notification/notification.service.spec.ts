import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule /*, getModelToken*/ } from '@nestjs/mongoose';
import mongoose, { connect, Connection } from 'mongoose';
import {
  Notification,
  NotificationSchema,
} from '../schemes/notification.scheme';
import { Comment, CommentSchema } from '../schemes/comment.schema';
import { Post, PostSchema } from '../schemes/post.schema';
import { User, UserSchema } from '../schemes/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { NotificationController } from './notification.controller';
import { InternalServerErrorException } from '@nestjs/common';
import { generateRandomNotifications } from './createMockData';
import { CreateNotificationDTO } from 'src/dto/notification-dto';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let notificationModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    notificationModule = await Test.createTestingModule({
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
          { name: Notification.name, schema: NotificationSchema },
        ]),
        JwtModule.registerAsync({
          global: true,
          useFactory: async () => ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60m' },
          }),
        }),
      ],
      controllers: [NotificationController],
      providers: [NotificationService],
    }).compile();

    notificationService =
      notificationModule.get<NotificationService>(NotificationService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
    await notificationModule.close();
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

  describe('createNotification method', () => {
    it('should be able to create follow notifications', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 50,
        postCount: 100,
        commentCount: 120,
        notificationCount: 10,
      });

      const createdBy = users[0]._id;
      const createdFor = users[1]._id;

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      const dto = {
        type: 'follow',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
      };
      await notificationService.createNotification(
        dto as CreateNotificationDTO,
      );

      const notificationsAfterUpdate = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterUpdate.length).toBe(1);
      expect(notificationsAfterUpdate[0].type).toStrictEqual('follow');
      expect(notificationsAfterUpdate[0].createdFor).toStrictEqual(createdFor);
      expect(notificationsAfterUpdate[0].createdBy).toStrictEqual(createdBy);
    });

    it('should be able to create comment notifications', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 50,
        postCount: 100,
        commentCount: 120,
        notificationCount: 10,
      });

      const createdBy = users[0]._id;
      const createdFor = users[1]._id;
      const relatedPost = posts.find((i) => i.comments.length > 1)._id;
      const relatedComment = comments.find(
        (i) => i.post._id === relatedPost,
      )._id;

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      const dto = {
        type: 'comment',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedPost: String(relatedPost),
        relatedComment: String(relatedComment),
      };
      await notificationService.createNotification(
        dto as CreateNotificationDTO,
      );

      const notificationsAfterUpdate = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterUpdate.length).toBe(1);
      expect(notificationsAfterUpdate[0].type).toStrictEqual('comment');
      expect(notificationsAfterUpdate[0].createdFor).toStrictEqual(createdFor);
      expect(notificationsAfterUpdate[0].createdBy).toStrictEqual(createdBy);
      expect(notificationsAfterUpdate[0].relatedPost).toStrictEqual(
        relatedPost,
      );
      expect(notificationsAfterUpdate[0].relatedComment).toStrictEqual(
        relatedComment,
      );
    });

    it('should be able to create answer notifications', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 50,
        postCount: 100,
        commentCount: 120,
        notificationCount: 10,
      });

      const createdBy = users[0]._id;
      const createdFor = users[1]._id;
      const relatedPost = posts.find((i) => i.comments.length > 1)._id;
      const relatedComment = comments.find(
        (i) => i.post._id === relatedPost,
      )._id;
      const answeredComment = comments[3]._id;

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      const dto = {
        type: 'answer',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedPost: String(relatedPost),
        relatedComment: String(relatedComment),
        answeredComment: String(answeredComment),
      };
      await notificationService.createNotification(
        dto as CreateNotificationDTO,
      );

      const notificationsAfterUpdate = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterUpdate.length).toBe(1);
      expect(notificationsAfterUpdate[0].type).toStrictEqual('answer');
      expect(notificationsAfterUpdate[0].createdFor).toStrictEqual(createdFor);
      expect(notificationsAfterUpdate[0].createdBy).toStrictEqual(createdBy);
      expect(notificationsAfterUpdate[0].relatedPost).toStrictEqual(
        relatedPost,
      );
      expect(notificationsAfterUpdate[0].relatedComment).toStrictEqual(
        relatedComment,
      );
    });

    it('should be able to create like notification for posts', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 50,
        postCount: 100,
        commentCount: 120,
        notificationCount: 10,
      });

      const createdBy = users[0]._id;
      const createdFor = users[1]._id;
      const relatedPost = posts.find((i) => i.comments.length > 1)._id;

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      const dto = {
        type: 'like',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedPost: String(relatedPost),
      };
      await notificationService.createNotification(
        dto as CreateNotificationDTO,
      );

      const notificationsAfterUpdate = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterUpdate.length).toBe(1);
      expect(notificationsAfterUpdate[0].type).toStrictEqual('like');
      expect(notificationsAfterUpdate[0].createdFor).toStrictEqual(createdFor);
      expect(notificationsAfterUpdate[0].createdBy).toStrictEqual(createdBy);
      expect(notificationsAfterUpdate[0].relatedPost).toStrictEqual(
        relatedPost,
      );
    });

    it('should be able to create like notification for comments', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 50,
        postCount: 100,
        commentCount: 120,
        notificationCount: 10,
      });

      const createdBy = users[0]._id;
      const createdFor = users[1]._id;
      const relatedPost = posts.find((i) => i.comments.length > 1)._id;
      const relatedComment = comments.find(
        (i) => i.post._id === relatedPost,
      )._id;

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      const dto = {
        type: 'like',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedPost: String(relatedPost),
        relatedComment: String(relatedComment),
      };
      await notificationService.createNotification(
        dto as CreateNotificationDTO,
      );

      const notificationsAfterUpdate = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterUpdate.length).toBe(1);
      expect(notificationsAfterUpdate[0].type).toStrictEqual('like');
      expect(notificationsAfterUpdate[0].createdFor).toStrictEqual(createdFor);
      expect(notificationsAfterUpdate[0].createdBy).toStrictEqual(createdBy);
      expect(notificationsAfterUpdate[0].relatedPost).toStrictEqual(
        relatedPost,
      );
      expect(notificationsAfterUpdate[0].relatedComment).toStrictEqual(
        relatedComment,
      );
    });

    it('should not create a follow notification if any other value, besides createdFor, createdBy and type given in the dto, and only should create follow notification with this exact values', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 50,
        postCount: 100,
        commentCount: 120,
        notificationCount: 10,
      });

      const createdBy = users[0]._id;
      const createdFor = users[1]._id;
      const relatedPost = posts.find((i) => i.comments.length > 1)._id;
      const relatedComment = comments.find(
        (i) => i.post._id === relatedPost,
      )._id;

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      let dto = {
        type: 'follow',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedPost: String(relatedPost),
      } as CreateNotificationDTO;

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      let notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);

      dto = {
        type: 'follow',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedComment: String(relatedComment),
      };

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);

      dto = {
        type: 'follow',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        answeredComment: String(relatedComment),
      };

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);

      //@ts-expect-error testing behaviour on absence of the createdFor key
      dto = {
        type: 'follow',
        createdBy: String(createdBy),
      };

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);
    });

    it('should not create a comment notification if any other value besides createdFor, createdBy, relatedPost, relatedComment and type given in the dto, and only should create comment notification with this exact values', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 50,
        postCount: 100,
        commentCount: 120,
        notificationCount: 10,
      });

      const createdBy = users[0]._id;
      const createdFor = users[1]._id;
      const relatedPost = posts.find((i) => i.comments.length > 1)._id;
      const answeredComment = comments[0]._id;
      const relatedComment = comments[1]._id;
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      let dto = {
        type: 'comment',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedPost: String(relatedPost),
        relatedComment: String(relatedComment),
        answeredComment: String(answeredComment),
      } as CreateNotificationDTO;

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      let notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);

      dto = {
        type: 'comment',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedComment: String(relatedComment),
        //@ts-expect-error key does not exists in type but im literally testing the behaviout on the key's existence
        someRandomKey: 'some value',
      };

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);

      dto = {
        type: 'comment',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
      };

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);
    });

    it('should not create an answer notification if any other value besides createdFor, createdBy, relatedPost, relatedComment, answeredComment and type given in the dto, and only should create answer notification with this exact values', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 50,
        postCount: 100,
        commentCount: 120,
        notificationCount: 10,
      });

      const createdBy = users[0]._id;
      const createdFor = users[1]._id;
      const relatedPost = posts.find((i) => i.comments.length > 1)._id;
      const answeredComment = comments[0]._id;
      const relatedComment = comments[1]._id;
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      let dto = {
        type: 'answer',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedPost: String(relatedPost),
        relatedComment: String(relatedComment),
        answeredComment: String(answeredComment),
        someRandomKey: 'some value',
      } as CreateNotificationDTO;

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      let notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);

      dto = {
        type: 'answer',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedComment: String(relatedComment),
      };

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);
    });

    it('should not create a like notification if any other value besides createdFor, createdBy, relatedPost, relatedComment, and type given in the dto, relatedComment is optional, other keys are essential', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 50,
        postCount: 100,
        commentCount: 120,
        notificationCount: 10,
      });

      const createdBy = users[0]._id;
      const createdFor = users[1]._id;
      const relatedPost = posts.find((i) => i.comments.length > 1)._id;
      const answeredComment = comments[0]._id;
      const relatedComment = comments[1]._id;
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      let dto = {
        type: 'like',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedPost: String(relatedPost),
        relatedComment: String(relatedComment),
        answeredComment: String(answeredComment),
      } as CreateNotificationDTO;

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      let notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);

      dto = {
        type: 'like',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
        relatedComment: String(relatedComment),
        //@ts-expect-error testing the behaviour on existence of a key that not exists in dto
        someRandomKey: 'some value',
      };

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);

      dto = {
        type: 'like',
        createdBy: String(createdBy),
        createdFor: String(createdFor),
      };

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);
    });
    it('should not create a notification if no type given in dto', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 50,
        postCount: 100,
        commentCount: 120,
        notificationCount: 10,
      });

      const createdBy = users[0]._id;
      const createdFor = users[1]._id;
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);

      const dto = {
        createdBy: String(createdBy),
        createdFor: String(createdFor),
      } as CreateNotificationDTO;

      expect(notificationService.createNotification(dto)).rejects.toThrowError(
        InternalServerErrorException,
      );

      const notificationsAfterMethodCall = await mongoConnection
        .collection('notifications')
        .find({})
        .toArray();

      expect(notificationsAfterMethodCall).toStrictEqual([]);
    });
  });
});
