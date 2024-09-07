import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type ImageDocument = HydratedDocument<Image>;

@Schema()
export class Image {
  @Prop({ required: true })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  imageData: Buffer;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  isRelated: boolean;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
