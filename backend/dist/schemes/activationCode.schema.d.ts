import { HydratedDocument, Types } from 'mongoose';
export type ActivationCodeDocument = HydratedDocument<ActivationCode>;
export declare class ActivationCode {
    user_id: Types.ObjectId;
    code: number;
    tryCount: number;
    createdAt: Date;
}
export declare const ActivationCodeSchema: import("mongoose").Schema<ActivationCode, import("mongoose").Model<ActivationCode, any, any, any, import("mongoose").Document<unknown, any, ActivationCode> & ActivationCode & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ActivationCode, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ActivationCode>> & import("mongoose").FlatRecord<ActivationCode> & {
    _id: Types.ObjectId;
}>;
