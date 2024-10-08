import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { MongooseModule /*, getModelToken*/ } from '@nestjs/mongoose';
import mongoose, { connect, Connection } from 'mongoose';
import { Comment, CommentSchema } from '../schemes/comment.schema';
import { Post, PostSchema } from '../schemes/post.schema';
import {
  Notification,
  NotificationSchema,
} from '../schemes/notification.scheme';
import { JwtModule } from '@nestjs/jwt';
import { generateRandomNotifications } from './createMockData';
import { User, UserSchema } from '../schemes/user.schema';
import { InternalServerErrorException } from '@nestjs/common';

function isWithinOneDay(date: Date) {
  const currentTime = new Date();
  const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  return currentTime.getTime() - date.getTime() <= oneDayInMs;
}

describe('NotificationController', () => {
  let notificationController: NotificationController;
  let mongod: MongoMemoryReplSet;
  let mongoConnection: Connection;
  let notificationModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
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

    notificationController = notificationModule.get<NotificationController>(
      NotificationController,
    );
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

  describe('getNotifications method', () => {
    it('should get the follow notifications created for user', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 2,
          notificationCount: 200,
          postCount: 10,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const filteredNotifications = notifications.filter(
        (i) =>
          //@ts-expect-error wait a min ya
          i.createdFor === userId &&
          (!i.isSeen || (i.isSeen && isWithinOneDay(i.updatedAt))),
      );
      const followNotificationCount = filteredNotifications.filter(
        (i) => i.type === 'follow',
      ).length;

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      const result = await notificationController.getNotifications({
        user: { sub: userId },
      });

      expect(result.filter((i) => i.type === 'follow').length).toEqual(
        followNotificationCount,
      );
    });

    it('should get the comment notifications created for user in expected format', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 10,
          notificationCount: 200,
          postCount: 10,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const filteredNotifications = notifications.filter(
        (i) =>
          //@ts-expect-error wait a min ya
          i.createdFor === userId &&
          (!i.isSeen || (i.isSeen && isWithinOneDay(i.updatedAt))),
      );
      const commentNotifications = filteredNotifications.filter(
        (i) => i.type === 'comment',
      );

      const notificationMap = new Map();

      commentNotifications.forEach((i) => {
        const key = i.relatedPost;

        if (notificationMap.has(key)) {
          notificationMap.get(key).push(i);
        } else {
          notificationMap.set(key, [i]);
        }
      });

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      const result = await notificationController.getNotifications({
        user: { sub: userId },
      });

      expect(result.filter((i) => i.type === 'comment').length).toEqual(
        Array.from(notificationMap.keys()).length,
      );
    });

    it('should get the answer notifications created for user in expected format', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 15,
          notificationCount: 200,
          postCount: 10,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const filteredNotifications = notifications.filter(
        (i) =>
          //@ts-expect-error wait a min ya
          i.createdFor === userId &&
          (!i.isSeen || (i.isSeen && isWithinOneDay(i.updatedAt))),
      );
      const answerNotifications = filteredNotifications.filter(
        (i) => i.type === 'answer',
      );

      const notificationMap = new Map();

      answerNotifications.forEach((i) => {
        const key = i.relatedComment;

        if (notificationMap.has(key)) {
          notificationMap.get(key).push(i);
        } else {
          notificationMap.set(key, [i]);
        }
      });

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      const result = await notificationController.getNotifications({
        user: { sub: userId },
      });

      expect(result.filter((i) => i.type === 'answer').length).toEqual(
        Array.from(notificationMap.keys()).length,
      );
    });

    it('should get the like notifications created for user in expected format', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 15,
          notificationCount: 200,
          postCount: 20,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const filteredNotifications = notifications.filter(
        (i) =>
          //@ts-expect-error wait a min ya
          i.createdFor === userId &&
          (!i.isSeen || (i.isSeen && isWithinOneDay(i.updatedAt))),
      );
      const likeNotifications = filteredNotifications.filter(
        (i) => i.type === 'like',
      );

      const notificationMap = new Map();

      likeNotifications.forEach((i) => {
        const key = `${i.relatedComment}_${i.relatedPost}`;

        if (notificationMap.has(key)) {
          notificationMap.get(key).push(i);
        } else {
          notificationMap.set(key, [i]);
        }
      });

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      const result = await notificationController.getNotifications({
        user: { sub: userId },
      });

      expect(result.filter((i) => i.type === 'like').length).toEqual(
        Array.from(notificationMap.keys()).length,
      );
    });

    it('should return an empty array if there are no notifications', async () => {
      const { users, posts, comments } = generateRandomNotifications({
        userCount: 15,
        notificationCount: 200,
        postCount: 20,
        commentCount: 10,
      });
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);

      const result = await notificationController.getNotifications({
        user: { sub: users[0]._id },
      });

      expect(result).toEqual([]);
    });
  });

  describe('seeNotification method', () => {
    it('should mark given notifications as seen, isSeen is true,', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 15,
          notificationCount: 200,
          postCount: 20,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const notificationIds = notifications
        .filter(
          //@ts-expect-error i.createdFor is an objectId
          (i) => !i.isSeen && i.createdFor === userId,
        )
        .map((i) => String(i._id));
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      await notificationController.seeNotification(
        { user: { sub: String(userId) } },
        { notificationIds },
      );

      const notificationsAfterUpdate = await mongoConnection
        .collection('notifications')
        .find({ createdFor: userId })
        .toArray();

      expect(notificationsAfterUpdate.find((i) => !i.isSeen)).toBeUndefined();
    });

    it('should throw error if given notificationIds does not correlate with the given userId', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 15,
          notificationCount: 200,
          postCount: 20,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const notificationIds = notifications
        .filter(
          //@ts-expect-error i.createdFor is an objectId
          (i) => !i.isSeen && i.createdFor !== userId,
        )
        .map((i) => String(i._id));
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      expect(
        notificationController.seeNotification(
          { user: { sub: String(userId) } },
          { notificationIds },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error, if given notificationIds does not exist in db', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 15,
          notificationCount: 200,
          postCount: 20,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const notificationIds = notifications.map(() =>
        String(new mongoose.Types.ObjectId()),
      );
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      expect(
        notificationController.seeNotification(
          { user: { sub: String(userId) } },
          { notificationIds },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should give the client appropriate message if no notificationIds sent', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 15,
          notificationCount: 200,
          postCount: 20,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const notificationIds = [];

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      const result = await notificationController.seeNotification(
        { user: { sub: String(userId) } },
        { notificationIds },
      );

      expect(result).toStrictEqual({
        message: 'No data provided. No operations were performed.',
      });
    });
  });

  describe('lookAtNotifications method', () => {
    it('should mark notifications as looked at, isLookedAt value is true', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 15,
          notificationCount: 200,
          postCount: 20,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const notificationIds = notifications
        .filter(
          //@ts-expect-error i.createdFor is an objectId
          (i) => !i.isLookedAt && i.createdFor === userId,
        )
        .map((i) => String(i._id));
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      await notificationController.lookAtNotifications(
        { user: { sub: String(userId) } },
        { notificationIds },
      );

      const notificationsAfterUpdate = await mongoConnection
        .collection('notifications')
        .find({ createdFor: userId })
        .toArray();

      expect(
        notificationsAfterUpdate.find((i) => !i.isLookedAt),
      ).toBeUndefined();
    });

    it('should throw error if given notificationIds does not correlate with the given userId', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 15,
          notificationCount: 200,
          postCount: 20,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const notificationIds = notifications
        .filter(
          //@ts-expect-error i.createdFor is an objectId
          (i) => !i.isLookedAt && i.createdFor !== userId,
        )
        .map((i) => String(i._id));
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      expect(
        notificationController.lookAtNotifications(
          { user: { sub: String(userId) } },
          { notificationIds },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error, if given notificationIds does not exist in db', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 15,
          notificationCount: 200,
          postCount: 20,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const notificationIds = notifications.map(() =>
        String(new mongoose.Types.ObjectId()),
      );
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      expect(
        notificationController.lookAtNotifications(
          { user: { sub: String(userId) } },
          { notificationIds },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should give the client appropriate message if no notificationIds sent', async () => {
      const { users, posts, comments, notifications } =
        generateRandomNotifications({
          userCount: 15,
          notificationCount: 200,
          postCount: 20,
          commentCount: 10,
        });

      const userId = users[0]._id;
      const notificationIds = [];

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);
      await mongoConnection
        .collection('notifications')
        //@ts-expect-error i did not understand the error
        .insertMany(notifications);

      const result = await notificationController.lookAtNotifications(
        { user: { sub: String(userId) } },
        { notificationIds },
      );

      expect(result).toStrictEqual({
        message: 'No data provided. No operations were performed.',
      });
    });
  });
});
