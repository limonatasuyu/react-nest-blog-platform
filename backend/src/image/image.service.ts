import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Image } from '../schemes/images.schema';
import { Model } from 'mongoose';
import { ObjectId } from 'bson';
//import { CreateImageDTO } from 'src/dto/image-dto';

@Injectable()
export class ImageService {
  constructor(@InjectModel(Image.name) private imagesModel: Model<Image>) {}

  async createImage(file: Express.Multer.File, user_id: string) {
    const createdImage = await this.imagesModel.create({
      _id: new ObjectId(),
      imageData: file.buffer,
      user: user_id,
      createdAt: new Date(),
      isRelated: false,
    });

    if (!createdImage) {
      throw new InternalServerErrorException();
    }

    await createdImage.save();
    return { imageId: createdImage._id };
  }

  async relateImage(imageId: string) {
    const updatedImage = await this.imagesModel.updateOne(
      { _id: imageId },
      { isRelated: true },
    );
    if (!updatedImage) {
      throw new InternalServerErrorException();
    }
  }

  async getImageWithId(imageId: string) {
    const image = await this.imagesModel.findById(imageId).select('imageData');
    if (!image) {
      throw new InternalServerErrorException();
    }
    return image.imageData;
  }
}
