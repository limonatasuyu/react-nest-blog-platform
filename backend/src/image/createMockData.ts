import * as mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { Image } from '../schemes/images.schema';
import { User } from '../schemes/user.schema';

function generateRandomUsers(count: number): User[] {
  return Array.from({ length: count }, () => ({
    _id: new mongoose.Types.ObjectId(),
  })) as unknown as User[];
}

function generateRandomImages({
  userCount,
  imageCount,
}: {
  userCount: number;
  imageCount: number;
}): { images: Image[]; users: User[] } {
  const users = generateRandomUsers(userCount);

  const mockImages: Image[] = Array.from({ length: imageCount }, () => ({
    _id: new mongoose.Types.ObjectId(),
    imageData: Buffer.from(faker.lorem.text()),
    user: faker.helpers.arrayElement(users)._id,
    createdAt: faker.date.recent(),
    isRelated: faker.datatype.boolean(),
  })) as unknown as Image[];

  return { images: mockImages, users };
}

export { generateRandomImages };
