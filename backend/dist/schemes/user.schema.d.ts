import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post } from './post.schema';
export type UserDocument = HydratedDocument<User>;
export declare class User {
    _id: mongoose.Schema.Types.ObjectId;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    isActivated: boolean;
    interests: string[];
    profilePictureId: string;
    savedPosts: Post[];
    description: string;
    passwordLastUpdatedAt: Date;
}
export declare const UserSchema: mongoose.Schema<User, mongoose.Model<User, any, any, any, mongoose.Document<unknown, any, User> & User & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, User, mongoose.Document<unknown, {}, mongoose.FlatRecord<User>> & mongoose.FlatRecord<User> & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>>;
