import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
export type ImageDocument = HydratedDocument<Image>;
export declare class Image {
    _id: mongoose.Schema.Types.ObjectId;
    imageData: Buffer;
    user: User;
    createdAt: Date;
    isRelated: boolean;
}
export declare const ImageSchema: mongoose.Schema<Image, mongoose.Model<Image, any, any, any, mongoose.Document<unknown, any, Image> & Image & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Image, mongoose.Document<unknown, {}, mongoose.FlatRecord<Image>> & mongoose.FlatRecord<Image> & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>>;
