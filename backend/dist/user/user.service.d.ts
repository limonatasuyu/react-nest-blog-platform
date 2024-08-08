import { User } from '../schemes/user.schema';
import { Model } from 'mongoose';
import { CreateUserDTO } from '../dto/create-user-dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<User>);
    create(dto: CreateUserDTO): Promise<User>;
}
