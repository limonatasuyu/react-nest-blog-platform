import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Tag } from '../schemes/tag.schema';

@Injectable()
export class TagService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) {}

  async findOne(name: string) {
    return await this.tagModel.findOne({ name });
  }

  async getPopularTags() {
    const tags = await this.tagModel
      .find()
      .sort({ postCount: -1 })
      .limit(3)
      .populate('name');
    if (!tags) {
      throw new InternalServerErrorException();
    }
    return tags;
  }

  async createTag(tagName: string) {
    const createdTag = this.tagModel.create({
      _id: new mongoose.Types.ObjectId(),
      name: tagName.toLowerCase(),
      postCount: 0,
    });
    if (!createdTag) {
      throw new InternalServerErrorException();
    }

    return { message: 'Tag created successfully.' };
  }

  async createTagsForPost(tags: string[]) {
    const tagNames = tags.map((tag) => tag.toLowerCase());

    // Perform bulkWrite to handle both upsert and increment postCount
    const bulkOps = tagNames.map((tag) => ({
      updateOne: {
        filter: { name: tag },
        update: {
          $inc: { postCount: 1 },
          $setOnInsert: {
            _id: new mongoose.Types.ObjectId(),
          },
        },
        upsert: true,
      },
    }));

    await this.tagModel.bulkWrite(bulkOps);

    // Fetch all the tags that were just upserted or updated
    const allTags = await this.tagModel
      .find({ name: { $in: tagNames } })
      .select('_id')
      .exec();

    return allTags;
  }
}
