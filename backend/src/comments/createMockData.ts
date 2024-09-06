import * as mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { Comment } from '..//schemes/comment.schema';
import { User } from '../schemes/user.schema';
import { Post } from '../schemes/post.schema';

const generateRandomUsers = (count: number): User[] => {
  return Array.from({ length: count }, () => ({
    _id: new mongoose.Types.ObjectId(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
  })) as unknown as User[];
};

const generateRandomPosts = (count: number): Post[] => {
  return Array.from({ length: count }, () => ({
    _id: new mongoose.Types.ObjectId(),
    title: faker.lorem.words(5),
    content: faker.lorem.paragraph(),
    comments: [],
  })) as unknown as Post[];
};

export const generateRandomComments = ({
  userCount,
  postCount,
  commentCount,
}: {
  userCount: number;
  postCount: number;
  commentCount: number;
}): { users: User[]; posts: Post[]; comments: Comment[] } => {
  const users = generateRandomUsers(userCount);
  const posts = generateRandomPosts(postCount);
  const comments: Comment[] = [];

  for (let i = 0; i < commentCount; i++) {
    const user = faker.helpers.arrayElement(users);
    const post = faker.helpers.arrayElement(posts);
    const answerTo =
      faker.datatype.boolean() && comments.length > 0
        ? faker.helpers.arrayElement(comments)._id
        : undefined;

    const newComment: Comment = {
      _id: new mongoose.Types.ObjectId(),
      content: faker.lorem.sentences(),
      user: user._id,
      createdAt: faker.date.recent(),
      likedBy: [
        ...new Set(
          Array.from({
            length: faker.number.int({ min: 0, max: userCount }),
          }).map(() => faker.helpers.arrayElement(users)._id),
        ),
      ],
      post: post._id,
      answerTo: answerTo,
      answers: [],
    } as unknown as Comment;

    comments.push(newComment);
    post.comments.push(newComment);
    if (!post.user) post.user = user;
    // If the comment has an `answerTo`, find that comment and add this one to its `answers`
    if (answerTo) {
      const parentComment = comments.find(
        (comment) => comment._id === answerTo,
      );
      if (parentComment) {
        parentComment.answers.push(newComment);
      }
    }
  }

  return { users, posts, comments };
};
