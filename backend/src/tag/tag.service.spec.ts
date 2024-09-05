import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TagService } from './tag.service';
import { Tag } from '../schemes/tag.schema';
//import { InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongoMemoryServer } from "mongodb-memory-server";

const tagName = 'mockTag';
const mockTag = (name = tagName, postCount = 0) => ({
  _id: 'some-id',
  name,
  postCount,
});

const mockTagModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  bulkWrite: jest.fn(),
};

describe('TagService', () => {
  let service: TagService;
  let model: Model<Tag>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: getModelToken(Tag.name),
          useValue: mockTagModel,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    model = module.get<Model<Tag>>(getModelToken(Tag.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a tag by name', async () => {
      const result = await service.findOne(tagName);
      expect(result).toEqual(mockTag);
    });
  });

  /*
  describe('getPopularTags', () => {
    it('should return popular tags', async () => {});

    it('should throw an InternalServerErrorException if no tags are found', async () => {});
  });

  describe('createTag', () => {
    it('should create a new tag', async () => {});

    it('should throw an InternalServerErrorException if tag creation fails', async () => {});
  });

  describe('createTagsForPost', () => {
    it('should upsert tags and return their IDs', async () => {});
  });*/
});
