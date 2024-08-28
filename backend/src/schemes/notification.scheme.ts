import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { Post } from './post.schema';
import { Comment } from './comment.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ required: true })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  type: 'comment' | 'follow' | 'like' | 'answer';

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdFor: User;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
  })
  relatedPost: Post;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'post',
  })
  relatedComment: Comment;

  @Prop({ required: true })
  isSeen: boolean;

  @Prop({ required: true })
  isLookedAt: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
