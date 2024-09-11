import * as mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { Tag } from '../schemes/tag.schema';

export function generateRandomTags(count: number): Tag[] {
  const usedNames = new Set<string>();
  const tags: Tag[] = [];

  while (tags.length < count) {
    const name = faker.word.noun();

    if (!usedNames.has(name)) {
      usedNames.add(name);
      tags.push({
        //@ts-expect-error i did not understand the error
        _id: new mongoose.Types.ObjectId(),
        name: name,
        postCount: faker.number.int({ min: 0, max: 1000 }),
      });
    }
  }

  return tags;
}
