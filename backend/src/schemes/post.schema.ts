import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { Comment } from './comment.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Comment' })
  comments: Comment[];

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;

  @Prop({ type: String, ref: 'Image' })
  thumbnailId: string;

  @Prop({ type: [String], ref: 'User' })
  likedBy: string[];

  @Prop({ type: [String], required: true })
  tags: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
