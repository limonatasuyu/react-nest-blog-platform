import { loginDTO } from 'src/dto/auth-dto';
import { UsersService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schemes/user.schema';
import { Model } from 'mongoose';
export declare class AuthService {
    private usersService;
    private jwtService;
    private userModel;
    constructor(usersService: UsersService, jwtService: JwtService, userModel: Model<User>);
    login(dto: loginDTO): Promise<{
        access_token: string;
        message: string;
    }>;
    getChangePasswordToken(userId: string, currentPassword: string): Promise<{
        token: string;
    }>;
    changePassword(newPassword: string, newPasswordAgain: string, userId: string, token: any): Promise<{
        message: string;
    }>;
    private verifyChangePasswordToken;
}
