import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from './image.controller';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule /*, getModelToken*/ } from '@nestjs/mongoose';
import mongoose, { connect, Connection } from 'mongoose';
import { Image, ImageSchema } from '../schemes/images.schema';
import { ImageService } from './image.service';
import { generateRandomImages } from './createMockData';
import { Readable } from 'node:stream';
import { JwtModule } from '@nestjs/jwt';
import { InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';

describe('ImageController', () => {
  let imageController: ImageController;
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

    imageController = imageModule.get<ImageController>(ImageController);
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

  describe('uploadImage', () => {
    it('should upload images', async () => {
      const initialImageCount = 20;
      const { users, images } = generateRandomImages({
        userCount: 10,
        imageCount: initialImageCount,
      });
      const userId = users[0]._id;

      //@ts-expect-error i need that
      await mongoConnection.collection('images').insertMany(images);
      const fakeFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('fake image data'),
        size: 12345,
        filename: 'test-image.png',
        path: '', // Not used in memory storage
        stream: null as unknown as Readable, // Set as unknown or null, not used in memory storage
        destination: '',
      };

      await imageController.uploadImage({ user: { sub: userId } }, fakeFile);
      const imagesAfterUpdate = await mongoConnection
        .collection('images')
        .find({});

      expect((await imagesAfterUpdate.toArray()).length).toEqual(
        initialImageCount + 1,
      );
    });

    it('should throw error if given file is not an image type', async () => {
      const initialImageCount = 20;
      const { users, images } = generateRandomImages({
        userCount: 10,
        imageCount: initialImageCount,
      });
      const userId = users[0]._id;

      //@ts-expect-error i need that
      await mongoConnection.collection('images').insertMany(images);
      //@ts-expect-error i need that
      await mongoConnection.collection('users').insertMany(users);

      const fakeFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.png',
        encoding: '7bit',
        mimetype: 'image/txt',
        buffer: Buffer.from('fake image data'),
        size: 12345,
        filename: 'test-image.png',
        path: '', // Not used in memory storage
        stream: null as unknown as Readable, // Set as unknown or null, not used in memory storage
        destination: '',
      };

      expect(
        imageController.uploadImage({ user: { sub: userId } }, fakeFile),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getImage method', () => {
    it('should return the image', async () => {
      const { users, images } = generateRandomImages({
        userCount: 10,
        imageCount: 20,
      });
      const image = images[0];
      const imageId = image._id;

      //@ts-expect-error i need that
      await mongoConnection.collection('images').insertMany(images);
      //@ts-expect-error i need that
      await mongoConnection.collection('users').insertMany(users);

      const res = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await imageController.getImage(String(imageId), res);
      expect(res.set).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      //expect(res.send).toHaveBeenCalledWith(Buffer.from(image.imageData));
      //@ts-expect-error its a mock
      expect(Buffer.from(res.send.mock.calls[0][0])).toEqual(
        Buffer.from(image.imageData),
      );
    });

    it('should throw error if image not exists in db', async () => {
      const { users, images } = generateRandomImages({
        userCount: 10,
        imageCount: 20,
      });
      const imageId = new mongoose.Types.ObjectId();

      //@ts-expect-error i need that
      await mongoConnection.collection('images').insertMany(images);
      //@ts-expect-error i need that
      await mongoConnection.collection('users').insertMany(users);

      const res = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      expect(
        imageController.getImage(String(imageId), res),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });
});
