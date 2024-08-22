import { UsersService } from './user.service';
import { CreateUserDTO, ActivateUserDTO, CreateActivationCodeDTO } from 'src/dto/user-dto';
export declare class UserModuleController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDTO): Promise<any>;
    activate(dto: ActivateUserDTO): Promise<any>;
    recreateActivation(dto: CreateActivationCodeDTO): Promise<any>;
    changePicture(req: any, { imageId }: {
        imageId: any;
    }): Promise<{
        message: string;
    }>;
}
