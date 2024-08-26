import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type tagDocument = HydratedDocument<Tag>;

@Schema()
export class Tag {
  @Prop({ required: true })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  postCount: number;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
