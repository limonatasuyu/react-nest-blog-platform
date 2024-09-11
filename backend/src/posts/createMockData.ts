import * as mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { Post } from '../schemes/post.schema';
import { User } from '../schemes/user.schema';
import { Comment } from '../schemes/comment.schema';
import { Tag } from '../schemes/tag.schema';
import { Image } from 'src/schemes/images.schema';

function generateRandomUsers(count: number): User[] {
  return Array.from({ length: count }, () => ({
    _id: new mongoose.Types.ObjectId(),
    username: faker.internet.userName(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    dateOfBirth: faker.date.past(),
    isActivated: faker.datatype.boolean(),
    interests: [],
    profilePictureId: faker.datatype.boolean()
      ? new mongoose.Types.ObjectId()
      : undefined,
    savedPosts: [],
    posts: [],
    description: faker.lorem.sentence(),
    passwordLastUpdatedAt: faker.date.recent(),
    followers: [],
  })) as unknown as User[];
}

function generateRandomComments(
  users: User[],
  commentCount: number,
): Comment[] {
  return Array.from({ length: commentCount }, () => ({
    _id: new mongoose.Types.ObjectId(),
    content: faker.lorem.sentences(),
    user: faker.helpers.arrayElement(users)._id,
    post: undefined, //faker.helpers.arrayElement(posts)._id,
    createdAt: faker.date.recent(),
    likedBy: Array.from({
      length: faker.number.int({ min: 0, max: users.length }),
    }).map(() => faker.helpers.arrayElement(users)._id),
    answerTo: undefined,
    answers: [],
  })) as unknown as Comment[];
}

function generateRandomTags(count: number): Tag[] {
  const usedNames = new Set<string>();
  const tags: Tag[] = [];

  while (tags.length < count) {
    const name = faker.word.noun(); // Generate random tag name

    // Ensure the tag name is unique
    if (!usedNames.has(name)) {
      usedNames.add(name);
      tags.push({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        postCount: faker.number.int({ min: 0, max: 1000 }), // Random post count
      } as unknown as Tag);
    }
  }

  return tags;
}

export function generateRandomPosts({
  userCount,
  commentCount,
  tagCount,
  postCount,
}: {
  userCount: number;
  commentCount: number;
  tagCount: number;
  postCount: number;
}): {
  users: User[];
  comments: Comment[];
  tags: Tag[];
  posts: Post[];
} {
  const users = generateRandomUsers(userCount);
  const comments = generateRandomComments(users, commentCount);
  const tags = generateRandomTags(tagCount);
  const posts: Post[] = [];

  for (let i = 0; i < postCount; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomComments = comments
      .sort(() => 0.5 - Math.random())
      .slice(0, faker.number.int({ min: 0, max: 10 })); // Random subset of comments

    const randomTags = tags
      .sort(() => 0.5 - Math.random())
      .slice(0, faker.number.int({ min: 1, max: 5 })); // Random subset of tags

    const postId = new mongoose.Types.ObjectId();
    posts.push({
      _id: postId,
      title: faker.lorem.sentence() + i,
      content: faker.lorem.paragraphs(2),
      user: randomUser._id,
      comments: randomComments,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      thumbnailId: faker.datatype.boolean()
        ? String(new mongoose.Types.ObjectId())
        : undefined,
      likedBy: faker.helpers.arrayElements(
        users.map((i) => i._id),
        faker.number.int({ min: 0, max: users.length }),
      ), // Random likes
      tags: randomTags.map((i) => i._id),
    } as unknown as Post);

    //@ts-expect-error needed
    randomUser.posts.push([postId]);

    randomComments.forEach((comment) => {
      //@ts-expect-error needed
      comment.post = postId;
    });
  }

  return { users, comments, tags, posts };
}

export function generateRandomImages({
  users,
  imageCount,
}: {
  users: User[];
  imageCount: number;
}): Image[] {
  const mockImages: Image[] = Array.from({ length: imageCount }, () => ({
    _id: new mongoose.Types.ObjectId(),
    imageData: Buffer.from(faker.lorem.text()),
    user: faker.helpers.arrayElement(users)._id,
    createdAt: faker.date.recent(),
    isRelated: faker.datatype.boolean(),
  })) as unknown as Image[];

  return mockImages;
}
