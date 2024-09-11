import * as mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { Notification } from '../schemes/notification.scheme';
import { User } from '../schemes/user.schema';
import { Post } from '../schemes/post.schema';
import { Comment } from '../schemes/comment.schema';

function generateRandomUsers(count: number): User[] {
  return Array.from({ length: count }, () => ({
    _id: new mongoose.Types.ObjectId(),
    username: faker.internet.userName(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    dateOfBirth: faker.date.past({ years: 30 }),
    isActivated: faker.datatype.boolean(),
    interests: [],
    profilePictureId: faker.datatype.boolean(0.5)
      ? new mongoose.Types.ObjectId()
      : undefined,
    savedPosts: [],
    posts: [],
    description: faker.lorem.sentence(),
    passwordLastUpdatedAt: faker.date.recent(),
    followers: [],
  })) as unknown as User[];
}

function generateRandomPosts(users: User[], postCount: number): Post[] {
  return Array.from({ length: postCount }, () => ({
    _id: new mongoose.Types.ObjectId(),
    title: faker.lorem.words(5),
    content: faker.lorem.paragraph(),
    user: faker.helpers.arrayElement(users)._id,
    thumbnailId: faker.datatype.boolean(0.5)
      ? new mongoose.Types.ObjectId()
      : undefined,
    comments: [],
  })) as unknown as Post[];
}

function generateRandomComments(
  users: User[],
  posts: Post[],
  commentCount: number,
): Comment[] {
  return Array.from({ length: commentCount }, () => ({
    _id: new mongoose.Types.ObjectId(),
    content: faker.lorem.sentences(),
    user: faker.helpers.arrayElement(users)._id,
    post: faker.helpers.arrayElement(posts)._id,
    createdAt: faker.date.recent(),
    likedBy: Array.from({
      length: faker.number.int({ min: 0, max: users.length }),
    }).map(() => faker.helpers.arrayElement(users)._id),
    answerTo: undefined, // Assuming we don't generate nested comments here
    answers: [],
  })) as unknown as Comment[];
}

export function generateRandomNotifications({
  userCount,
  postCount,
  commentCount,
  notificationCount,
}: {
  userCount: number;
  postCount: number;
  commentCount: number;
  notificationCount: number;
}): {
  notifications: Notification[];
  users: User[];
  posts: Post[];
  comments: Comment[];
} {
  const users = generateRandomUsers(userCount);
  const posts = generateRandomPosts(users, postCount);
  const comments = generateRandomComments(users, posts, commentCount);
  const types = ['comment', 'follow', 'like', 'answer'];

  posts.forEach((i) => {
    i.comments = comments.filter((x) => x.post._id === i._id);
  });

  const notifications = Array.from({ length: notificationCount }, () => {
    const createdBy = faker.helpers.arrayElement(users)._id;
    let createdFor: mongoose.Schema.Types.ObjectId;

    do {
      createdFor = faker.helpers.arrayElement(users)._id;
    } while (String(createdBy) !== String(createdFor));

    const notification: Notification = {
      _id: new mongoose.Types.ObjectId(),
      type: faker.helpers.arrayElement(types),
      createdBy: createdBy,
      createdFor: createdFor,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      isSeen: faker.datatype.boolean(0.5),
      isLookedAt: faker.datatype.boolean(),
      relatedPost: undefined,
      relatedComment: undefined,
      answeredComment: undefined,
    } as unknown as Notification;

    // Set relatedPost, relatedComment, or answeredComment based on the notification type
    if (notification.type !== 'follow') {
      //@ts-expect-error i need that
      notification.relatedPost = faker.helpers.arrayElement(posts)._id;
      //@ts-expect-error i need that
      notification.relatedComment = faker.helpers.arrayElement(comments)._id;
    }
    if (notification.type === 'answer') {
      //@ts-expect-error i need that
      notification.answeredComment = faker.helpers.arrayElement(comments)._id;
    }

    return notification;
  });

  return { users, posts, comments, notifications };
}
