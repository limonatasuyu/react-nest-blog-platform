import { loginDTO } from '../dto/auth-dto';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: loginDTO): Promise<{
        access_token: string;
        message: string;
    }>;
    getProfile(req: any): any;
}
