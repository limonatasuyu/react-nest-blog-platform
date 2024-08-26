import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { Comment } from './comment.schema';
import { Tag } from './tag.schema';
export type PostDocument = HydratedDocument<Post>;
export declare class Post {
    _id: string;
    title: string;
    content: string;
    user: User;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
    thumbnailId: string;
    likedBy: User[];
    tags: Tag[];
}
export declare const PostSchema: mongoose.Schema<Post, mongoose.Model<Post, any, any, any, mongoose.Document<unknown, any, Post> & Post & Required<{
    _id: string;
}>, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Post, mongoose.Document<unknown, {}, mongoose.FlatRecord<Post>> & mongoose.FlatRecord<Post> & Required<{
    _id: string;
}>>;
