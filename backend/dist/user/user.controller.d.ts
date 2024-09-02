import { UsersService } from './user.service';
import { CreateUserDTO, ActivateUserDTO, CreateActivationCodeDTO } from 'src/dto/user-dto';
export declare class UserModuleController {
    private readonly usersService;
    constructor(usersService: UsersService);
    followUser(req: any, username: any): Promise<{
        message: string;
    }>;
    getUser(req: any, username: any): Promise<{
        username: string;
        firstname: string;
        lastname: string;
        description: string;
        email: string;
        profilePictureId: string;
        isUserFollowing: boolean;
    }>;
    create(dto: CreateUserDTO): Promise<any>;
    activate(dto: ActivateUserDTO): Promise<any>;
    recreateActivation(dto: CreateActivationCodeDTO): Promise<any>;
    changePicture(req: any, { imageId }: {
        imageId: any;
    }): Promise<{
        message: string;
    }>;
    change_description(req: any, { description }: {
        description: any;
    }): Promise<{
        message: string;
    }>;
}
