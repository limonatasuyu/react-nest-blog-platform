import { User } from '../schemes/user.schema';
import { ActivationCode } from '../schemes/activationCode.schema';
import { Model } from 'mongoose';
import { ActivateUserDTO, CreateUserDTO, CreateActivationCodeDTO } from '../dto/user-dto';
import { ImageService } from 'src/image/image.service';
import { NotificationService } from 'src/notification/notification.service';
export declare class UsersService {
    private userModel;
    private activationCodeModel;
    private imageService;
    private notificationService;
    constructor(userModel: Model<User>, activationCodeModel: Model<ActivationCode>, imageService: ImageService, notificationService: NotificationService);
    activate(dto: ActivateUserDTO): Promise<{
        message: string;
    }>;
    create(dto: CreateUserDTO): Promise<any>;
    createActivationCode(dto: CreateActivationCodeDTO): Promise<{
        message: string;
    }>;
    findOne(usernameOrEmail: string): Promise<User | undefined>;
    findById(userId: string): Promise<User | undefined>;
    getById(user_id: string): Promise<{
        firstname: string;
        lastname: string;
        username: string;
        email: string;
        profilePictureId: string;
    }>;
    changeProfilePicture(pictureId: string, userId: string): Promise<{
        message: string;
    }>;
    changeDescription(description: string, userId: string): Promise<{
        message: string;
    }>;
    getRecommendedUsers(): Promise<any[]>;
    follow(userToFollowUsername: string, followingUserId: string): Promise<{
        message: string;
    }>;
    getSearchResults(page: number, keyword: string): Promise<any>;
}
