import { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
export type ImageDocument = HydratedDocument<Image>;
export declare class Image {
    _id: string;
    imageData: Buffer;
    user: User;
    createdAt: Date;
    isRelated: boolean;
}
export declare const ImageSchema: import("mongoose").Schema<Image, import("mongoose").Model<Image, any, any, any, import("mongoose").Document<unknown, any, Image> & Image & Required<{
    _id: string;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Image, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Image>> & import("mongoose").FlatRecord<Image> & Required<{
    _id: string;
}>>;
