import * as mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { User } from '../schemes/user.schema';
import { Post } from '../schemes/post.schema';
import * as bcrypt from 'bcrypt';

export async function generateRandomUsers({
  userCount,
  postCount,
}: {
  userCount: number;
  postCount: number;
}): Promise<User[]> {
  const users: User[] = [];
  const posts = Array.from(
    { length: postCount },
    () => new mongoose.Types.ObjectId(),
  ) as unknown as Post[];

  for (let i = 0; i < userCount; i++) {
    const randomSavedPosts = faker.helpers.arrayElements(
      posts,
      faker.number.int({ min: 0, max: 10 }),
    );
    const randomUserPosts = faker.helpers.arrayElements(
      posts,
      faker.number.int({ min: 0, max: 5 }),
    );

    const passwordNotEncryped = faker.internet.password();
    const saltRounds = 10;
    const password = await bcrypt.hash(passwordNotEncryped, saltRounds);

    users.push({
      _id: new mongoose.Types.ObjectId(),
      username: faker.internet.userName(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
      password,
      passwordNotEncryped,
      dateOfBirth: faker.date.past(),
      isActivated: faker.datatype.boolean(),
      interests: faker.helpers.arrayElements(
        ['music', 'sports', 'coding', 'gaming', 'reading', 'travel'],
        faker.number.int({ min: 1, max: 3 }),
      ),
      profilePictureId: faker.datatype.boolean()
        ? new mongoose.Types.ObjectId()
        : undefined,
      savedPosts: randomSavedPosts,
      posts: randomUserPosts,
      description: faker.lorem.sentence(),
      passwordLastUpdatedAt: faker.date.recent(),
      followers: [],
    } as unknown as User);
  }

  users.forEach((user) => {
    user.followers = faker.helpers
      .arrayElements(users, faker.number.int({ min: 0, max: 10 }))
      .map((follower) => follower._id) as unknown as User[];
  });

  return users;
}
