import { loginDTO } from 'src/dto/auth-dto';
import { UsersService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(dto: loginDTO): Promise<{
        access_token: string;
    }>;
}
