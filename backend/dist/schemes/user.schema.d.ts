import { HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<User>;
export declare class User {
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    isActivated: boolean;
    interests: string[];
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, import("mongoose").Document<unknown, any, User> & User & Required<{
    _id: string;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: string;
}>>;
