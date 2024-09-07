import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule /*, getModelToken*/ } from '@nestjs/mongoose';
import mongoose, { connect, Connection } from 'mongoose';
import { Image, ImageSchema } from '../schemes/images.schema';
import { generateRandomImages } from './createMockData';
import { JwtModule } from '@nestjs/jwt';
import { ImageController } from './image.controller';
import { InternalServerErrorException } from '@nestjs/common';
describe('ImageService', () => {
  let imageService: ImageService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let imageModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;

    imageModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri: uri,
          }),
        }),
        JwtModule.registerAsync({
          global: true,
          useFactory: async () => ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60m' },
          }),
        }),
        MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
      ],
      controllers: [ImageController],
      providers: [ImageService],
    }).compile();

    imageService = imageModule.get<ImageService>(ImageService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
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

  describe('relateImage method', () => {
    it('should mark image as related', async () => {
      const { users, images } = generateRandomImages({
        userCount: 10,
        imageCount: 20,
      });
      const imageId = images.find((i) => !i.isRelated)._id;

      //@ts-expect-error i need that
      await mongoConnection.collection('images').insertMany(images);
      //@ts-expect-error i need that
      await mongoConnection.collection('users').insertMany(users);

      await imageService.relateImage(String(imageId));

      const imageInDB = await mongoConnection
        .collection('images')
        .find({ _id: imageId });

      expect((await imageInDB.toArray())[0].isRelated).toBe(true);
    });

    it('should throw InternalServerErrorException if given imageId is not corresponds to any image in db', async () => {
      const { users, images } = generateRandomImages({
        userCount: 10,
        imageCount: 20,
      });
      const imageId = new mongoose.Types.ObjectId();

      //@ts-expect-error i need that
      await mongoConnection.collection('images').insertMany(images);
      //@ts-expect-error i need that
      await mongoConnection.collection('users').insertMany(users);

      expect(imageService.relateImage(String(imageId))).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteUnUsedImages method', () => {
    it('should delete unused images, which means the ones that isRelated values are false', async () => {
      const { users, images } = generateRandomImages({
        userCount: 10,
        imageCount: 20,
      });
      const usedImageCount = images.filter((i) => i.isRelated).length;

      //@ts-expect-error i need that
      await mongoConnection.collection('images').insertMany(images);
      //@ts-expect-error i need that
      await mongoConnection.collection('users').insertMany(users);

      await imageService.deleteUnUsedImages();

      const imagesAfterUpdate = await mongoConnection
        .collection('images')
        .find({});

      expect((await imagesAfterUpdate.toArray()).length).toEqual(usedImageCount);
    });
  });
});
