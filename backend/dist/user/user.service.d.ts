import { User } from '../schemes/user.schema';
import { ActivationCode } from '../schemes/activationCode.schema';
import { Model } from 'mongoose';
import { ActivateUserDTO, CreateUserDTO, CreateActivationCodeDTO } from '../dto/user-dto';
export declare class UsersService {
    private userModel;
    private activationCodeModel;
    constructor(userModel: Model<User>, activationCodeModel: Model<ActivationCode>);
    activate(dto: ActivateUserDTO): Promise<{
        message: string;
    }>;
    create(dto: CreateUserDTO): Promise<any>;
    createActivationCode(dto: CreateActivationCodeDTO): Promise<{
        message: string;
    }>;
    findOne(usernameOrEmail: string): Promise<User | undefined>;
}
