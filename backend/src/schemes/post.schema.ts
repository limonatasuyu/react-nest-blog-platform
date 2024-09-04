import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { Comment } from './comment.schema';
import { Tag } from './tag.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, index: 'text' })
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

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  likedBy: User[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], required: true, ref: 'Tag' })
  tags: Tag[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
