import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { Tag, TagSchema } from '../schemes/tag.schema';
//import { InternalServerErrorException } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose, { connect, Connection } from 'mongoose';
import { generateRandomTags } from './createMockData';
import { InternalServerErrorException } from '@nestjs/common';

describe('TagService', () => {
  let service: TagService;
  let mongod: MongoMemoryServer;
  let tagModule: TestingModule;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    tagModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }]),
      ],
      providers: [TagService],
    }).compile();

    service = tagModule.get<TagService>(TagService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
    await tagModule.close();
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

  describe('findOne method', () => {
    it('should return a notification by name', async () => {
      const tags = generateRandomTags(100);
      const tag = tags[0];

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('tags').insertMany(tags);

      const result = await service.findOne(tag.name);
      expect(result.name).toBe(tag.name);
      expect(result._id).toStrictEqual(tag._id);
      expect(result.postCount).toBe(tag.postCount);
    });

    it('should return null if given name not corresponds with a notification in db', async () => {
      const tags = generateRandomTags(100);
      const tagName =
        'a tag name that does not corresponds with a notification in db';

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('tags').insertMany(tags);

      const result = await service.findOne(tagName);
      expect(result).toBe(null);
    });
  });

  describe('getPopularTags method', () => {
    it('should return the name of the three tags with most postCounts', async () => {
      const tags = generateRandomTags(100);
      const popularTags = tags
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 3)
        .map((i) => i.name);

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('tags').insertMany(tags);

      const result = await service.getPopularTags();
      expect(result.length).toBe(3);
      expect(
        result.every((tag, index) => tag.name === popularTags[index]),
      ).toBe(true);
    });

    it('should return the name of the at most three tags with most postCounts', async () => {
      const tags = generateRandomTags(2);
      const popularTags = tags
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 3)
        .map((i) => i.name);

      //@ts-expect-error i did not understand the error
      await mongoConnection.collection('tags').insertMany(tags);

      const result = await service.getPopularTags();
      expect(result.length).toBe(2);
      expect(
        result.every((tag, index) => tag.name === popularTags[index]),
      ).toBe(true);
    });

    it('should return an empty array if there are no tags in db', async () => {
      const result = await service.getPopularTags();
      expect(result).toStrictEqual([]);
    });
  });

  describe('createTagsForPost method', () => {
    it('should create tags with post count of 1', async () => {
      const tags = ['tag1', 'tag2', 'tag3'];

      await service.createTagsForPost(tags);

      const tagsAfterMethodCall = await mongoConnection
        .collection('tags')
        .find()
        .toArray();

      expect(
        tagsAfterMethodCall.every((tag, index) => tag.name === tags[index]),
      ).toBe(true);
    });
  });

  it('should not create any tags and throw an error if no tags were provided', async () => {
    //@ts-expect-error testing the behaviour with no arguments
    expect(service.createTagsForPost()).rejects.toThrow(
      InternalServerErrorException,
    );

    let tagsAfterMethodCall = await mongoConnection
      .collection('tags')
      .find()
      .toArray();

    expect(tagsAfterMethodCall).toStrictEqual([]);

    expect(service.createTagsForPost([])).rejects.toThrow(
      InternalServerErrorException,
    );

    tagsAfterMethodCall = await mongoConnection
      .collection('tags')
      .find()
      .toArray();

    expect(tagsAfterMethodCall).toStrictEqual([]);
  });
});
