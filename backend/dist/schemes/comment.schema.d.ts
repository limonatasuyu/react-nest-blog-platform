import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { Post } from './post.schema';
export type CommentDocument = HydratedDocument<Comment>;
export declare class Comment {
    _id: mongoose.Schema.Types.ObjectId;
    content: string;
    user: User;
    answerTo: Comment;
    createdAt: Date;
    likedBy: User[];
    post: Post;
    answers: Comment[];
}
export declare const CommentSchema: mongoose.Schema<Comment, mongoose.Model<Comment, any, any, any, mongoose.Document<unknown, any, Comment> & Comment & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Comment, mongoose.Document<unknown, {}, mongoose.FlatRecord<Comment>> & mongoose.FlatRecord<Comment> & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>>;
