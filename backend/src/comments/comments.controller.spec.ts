import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { MongooseModule /*, getModelToken*/ } from '@nestjs/mongoose';
import mongoose, { connect, Connection } from 'mongoose';
import { Comment, CommentSchema } from '../schemes/comment.schema';
import { Post, PostSchema } from '../schemes/post.schema';
import { NotificationModule } from '../notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import { generateRandomComments } from './createMockData';
import { User, UserSchema } from '../schemes/user.schema';
import { NotificationService } from '../notification/notification.service';
import { InternalServerErrorException } from '@nestjs/common';
import { UserModule } from '../user/user.module';

describe('CommentsController', () => {
  let commentsController: CommentsController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let commentsModule: TestingModule;

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

    commentsController =
      commentsModule.get<CommentsController>(CommentsController);
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

  describe('getComments method', () => {
    it('should return max 10 comments with postId, max 2 answers of the comments, also totalPageCount for comments as a whole and answerPageCount for individual comments', async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 2,
        commentCount: 100,
      });
      const postId = posts[0]._id;

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      const allPostRelatedComments = comments.filter((i) => {
        return String(i.post) === String(postId) && !i.answerTo;
      });

      const expectedComments = allPostRelatedComments
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 10);

      const expectedPageSize =
        expectedComments.length === 0
          ? 1
          : Math.ceil(allPostRelatedComments.length * 0.1);

      const receivedData = await commentsController.getComments({
        page: 1,
        postId,
      });
      const receivedAnswers = receivedData.comments.map((i) => i.answers);

      expect(receivedData.comments.length).toEqual(expectedComments.length);

      receivedData.comments.forEach((comment) => {
        const expectedAnswers = comments.find(
          (i) => String(i._id) === String(comment._id),
        )?.answers;

        const expectedPageCount = Math.ceil(expectedAnswers.length * 0.5);
        expect(comment.answerPageCount).toEqual(expectedPageCount);
      });

      receivedAnswers.forEach((subArray) => {
        expect(subArray.length).toBeLessThanOrEqual(2);
      });

      expect(receivedData.totalPageCount).toEqual(expectedPageSize);
    });

    it('should return an empty array for comments and totalPageCount of 1 if post is not exist', async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const postId = new mongoose.Types.ObjectId();

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      const receivedData = await commentsController.getComments({
        page: 1,
        postId,
      });

      expect(receivedData.comments).toEqual([]);
      expect(receivedData.totalPageCount).toBe(1);
    });
  });

  describe('getAnswers method', () => {
    it('should return answers for the given commentId, max 2 answers should be received, it should give the 3rd and 4th answers if the given page is 1', async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const comment = comments[0];

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      const expectedAnswerIds = comment.answers
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(2, 4)
        .map((i) => i._id);
      const expectedAnswers = comments.filter(
        (i) => i._id === expectedAnswerIds[0] || i._id === expectedAnswerIds[1],
      );
      const receivedData = await commentsController.getAnswers({
        page: 1,
        commentId: comment._id,
      });

      expectedAnswers.forEach((expectedAnswer) => {
        expect(receivedData).toContainEqual(
          expect.objectContaining({
            content: expectedAnswer.content,
          }),
        );
      });
    });

    it('should return an empty array if there if given commentId have no corresponding comment in the db', async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const commentId = new mongoose.Types.ObjectId();

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      const receivedData = await commentsController.getAnswers({
        page: 1,
        commentId,
      });

      expect(receivedData).toEqual([]);
    });
  });

  describe('likeComment method', () => {
    it('should update the comment, if the update caused the comment to be liked, also should trigger the createNotification method of the notification service', async () => {
      const createNotification = jest.spyOn(
        NotificationService.prototype,
        'createNotification',
      );
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const commentBeforeUpdate = comments[0];
      const user = users[0];

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      const isCommentLiked = !commentBeforeUpdate.likedBy.includes(
        user._id as unknown as User,
      );

      await commentsController.likeComment(
        { user: { sub: user._id } },
        String(commentBeforeUpdate._id),
      );

      if (isCommentLiked) {
        expect(createNotification).toBeCalled();
      }

      const updatedComment = await mongoConnection
        .collection('comments')
        .findOne({ _id: commentBeforeUpdate._id });

      if (isCommentLiked) {
        expect(updatedComment.likedBy.length).toEqual(
          commentBeforeUpdate.likedBy.length + 1,
        );
      } else {
        expect(updatedComment.likedBy.length).toEqual(
          commentBeforeUpdate.likedBy.length - 1,
        );
      }
    });
    it('should throw an internalServerError if a user id that is not corresponds to a user in the db is given', async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const commentId = comments[0]._id;
      const userId = new mongoose.Types.ObjectId();

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      await expect(
        commentsController.likeComment(
          { user: { sub: userId } },
          String(commentId),
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('addComment method', () => {
    it("should add a comment to the db, also trigger the createNotification method if post's user and comment's user is not same", async () => {
      const createNotification = jest.spyOn(
        NotificationService.prototype,
        'createNotification',
      );
      const initialCommentCount = 100;
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: initialCommentCount,
      });
      const userId = users[0]._id;
      const post = posts[0];
      const postId = post._id;
      const content = 'A comment, probably about the post';

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      await commentsController.addComment(
        { user: { sub: userId } },
        { postId: String(postId), content },
      );

      const commentsInDB = await mongoConnection
        .collection('comments')
        .find({});

      expect((await commentsInDB.toArray()).length).toEqual(
        initialCommentCount + 1,
      );

      if (String(userId) !== String(post.user._id)) {
        expect(createNotification).toHaveBeenCalled();
      }
    });
    it("should add the comment as an answer if answeredCommentId and ownerCommentId exists, meaning should update the answered comment's answers array, also create notification for both post's user and ownerComment's user", async () => {
      const createNotification = jest.spyOn(
        NotificationService.prototype,
        'createNotification',
      );
      const initialCommentCount = 100;
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: initialCommentCount,
      });
      const userId = users[0]._id;
      const post = posts[0];
      const postId = post._id;
      const answeredCommentBeforeUpdate = posts[0].comments[0];
      const answeredCommentId = String(answeredCommentBeforeUpdate._id);
      const content = 'A comment, probably about the post';

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      await commentsController.addComment(
        { user: { sub: userId } },
        {
          postId: String(postId),
          content,
          ownerCommentId: answeredCommentId,
          answeredCommentId,
        },
      );

      const ownerCommentInDB = await mongoConnection
        .collection('comments')
        .find({ _id: new mongoose.Types.ObjectId(answeredCommentId) })
        .toArray();

      expect(ownerCommentInDB[0].answers.length).toEqual(
        answeredCommentBeforeUpdate.answers.length + 1,
      );

      expect(createNotification).toBeCalledTimes(2);
    });

    it("should throw an error if ownerCommentId exists in dto but answeredCommentId isn't", async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const userId = users[0]._id;
      const postId = posts[0]._id;
      const answeredCommentBeforeUpdate = posts[0].comments[0];
      const answeredCommentId = String(answeredCommentBeforeUpdate._id);
      const content = 'A comment, probably about the post';

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      expect(
        commentsController.addComment(
          { user: { sub: userId } },
          {
            postId: String(postId),
            content,
            ownerCommentId: answeredCommentId,
          },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it("should throw an error if answeredCommentId exists in dto but ownerCommentId isn't", async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const userId = users[0]._id;
      const postId = posts[0]._id;
      const answeredCommentBeforeUpdate = posts[0].comments[0];
      const answeredCommentId = String(answeredCommentBeforeUpdate._id);
      const content = 'A comment, probably about the post';

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      expect(
        commentsController.addComment(
          { user: { sub: userId } },
          {
            postId: String(postId),
            content,
            answeredCommentId,
          },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteComment method', () => {
    it("should delete existing comment from db, as well as the related post's comments array", async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const commentToDelete = comments[0];
      const post = posts.find((i) => i.comments.includes(commentToDelete));
      const postCommentsBeforeUpdate = post.comments;

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      await commentsController.deleteComment({
        postId: String(post._id),
        commentId: String(commentToDelete._id),
      });

      const deletedComment = await mongoConnection
        .collection('comments')
        .findOne({ _id: commentToDelete._id });

      const postAfterUpdate = await mongoConnection
        .collection('posts')
        .findOne({ _id: post._id });

      expect(deletedComment).toBeNull();

      expect(postAfterUpdate.comments.length).toBe(
        postCommentsBeforeUpdate.length - 1,
      );
    });

    it('should throw error if given postId is not corrensponds to any post in db', async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const commentToDelete = comments[0];
      const postId = new mongoose.Types.ObjectId();

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      expect(
        commentsController.deleteComment({
          postId: String(postId),
          commentId: String(commentToDelete._id),
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if given commentId is not corrensponds to any post in db', async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const postId = posts[0]._id;
      const commentId = new mongoose.Types.ObjectId();

      await mongoConnection.collection<User>('users').insertMany(users);
      await mongoConnection.collection<Post>('posts').insertMany(posts);
      await mongoConnection
        .collection<Comment>('comments')
        .insertMany(comments);

      expect(
        commentsController.deleteComment({
          postId: String(postId),
          commentId: String(commentId),
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if given commentId is not corrensponds to the given postId', async () => {
      const { users, posts, comments } = generateRandomComments({
        userCount: 10,
        postCount: 20,
        commentCount: 100,
      });
      const postId = posts[0]._id;
      const commentId = posts.slice(1).find((i) => i.comments.length)
        .comments[0]._id;

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('users').insertMany(users);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('posts').insertMany(posts);
      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('comments').insertMany(comments);

      expect(
        commentsController.deleteComment({
          postId: String(postId),
          commentId: String(commentId),
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
