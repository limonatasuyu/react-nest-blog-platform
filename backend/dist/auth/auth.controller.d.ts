import { loginDTO } from '../dto/auth-dto';
import { AuthService } from './auth.service';
import { UsersService } from 'src/user/user.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(dto: loginDTO): Promise<{
        access_token: string;
        message: string;
    }>;
    getProfile(req: any): Promise<{
        firstname: string;
        lastname: string;
        username: string;
        email: string;
        profilePictureId: string;
    }>;
}
