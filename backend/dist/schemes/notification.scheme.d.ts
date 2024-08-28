import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { Post } from './post.schema';
import { Comment } from './comment.schema';
export type NotificationDocument = HydratedDocument<Notification>;
export declare class Notification {
    _id: mongoose.Schema.Types.ObjectId;
    type: 'comment' | 'follow' | 'like' | 'answer';
    createdBy: User;
    createdFor: User;
    createdAt: Date;
    relatedPost: Post;
    relatedComment: Comment;
}
export declare const NotificationSchema: mongoose.Schema<Notification, mongoose.Model<Notification, any, any, any, mongoose.Document<unknown, any, Notification> & Notification & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Notification, mongoose.Document<unknown, {}, mongoose.FlatRecord<Notification>> & mongoose.FlatRecord<Notification> & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>>;
