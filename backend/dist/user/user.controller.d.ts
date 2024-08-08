import { UsersService } from './user.service';
import { CreateUserDTO } from 'src/dto/create-user-dto';
export declare class UserModuleController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDTO): Promise<any>;
}
