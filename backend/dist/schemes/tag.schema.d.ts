import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
export type tagDocument = HydratedDocument<Tag>;
export declare class Tag {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    postCount: number;
}
export declare const TagSchema: mongoose.Schema<Tag, mongoose.Model<Tag, any, any, any, mongoose.Document<unknown, any, Tag> & Tag & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Tag, mongoose.Document<unknown, {}, mongoose.FlatRecord<Tag>> & mongoose.FlatRecord<Tag> & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>>;
