import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { UsersService } from 'src/user/user.service';
import { GetPostsDTO, CreatePostDTO, DeletePostDTO, UpdatePostDTO } from '../dto/post-dto';
import { ImageService } from 'src/image/image.service';
import { User } from 'src/schemes/user.schema';
import { TagService } from 'src/tag/tag.service';
import { NotificationService } from 'src/notification/notification.service';
export declare class PostsService {
    private postsModel;
    private usersModel;
    private usersService;
    private imageService;
    private tagService;
    private notificationService;
    constructor(postsModel: Model<Post>, usersModel: Model<User>, usersService: UsersService, imageService: ImageService, tagService: TagService, notificationService: NotificationService);
    getPostByIdAndUser(postId: string, user_id: string): Promise<mongoose.Document<unknown, {}, Post> & Post & Required<{
        _id: string;
    }>>;
    savePost(postId: string, user_id: string): Promise<{
        message: string;
    }>;
    likePost(postId: string, user_id: string): Promise<{
        message: string;
    }>;
    getPosts(dto: GetPostsDTO): Promise<any>;
    createPost(dto: CreatePostDTO, username: string): Promise<{
        message: string;
    }>;
    deletePost(dto: DeletePostDTO, username: string): Promise<{
        message: string;
    }>;
    updatePost(dto: UpdatePostDTO, username: string): Promise<{
        message: string;
    }>;
    getPostById(postId: string, user_id: string): Promise<any>;
    getSearchResults(page: number, keyword: string): Promise<any>;
}
