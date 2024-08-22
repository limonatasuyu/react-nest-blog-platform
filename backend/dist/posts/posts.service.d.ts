import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { UsersService } from 'src/user/user.service';
import { GetPostsByTagDTO, GetRecentPostsDTO, CreatePostDTO, DeletePostDTO, UpdatePostDTO } from '../dto/post-dto';
import { ImageService } from 'src/image/image.service';
export declare class PostsService {
    private postsModel;
    private usersService;
    private imageService;
    constructor(postsModel: Model<Post>, usersService: UsersService, imageService: ImageService);
    getPostByIdAndUser(postId: string, user_id: string): Promise<mongoose.Document<unknown, {}, Post> & Post & Required<{
        _id: string;
    }>>;
    getPostsByTag(dto: GetPostsByTagDTO): Promise<{
        title: string;
        content: string;
        commentCount: number;
        likedCount: number;
        thumbnailId: string;
        tags: string[];
        user: {
            username: string;
            name: string;
        };
    }[]>;
    getRecentPosts(dto: GetRecentPostsDTO): Promise<{
        id: string;
        title: string;
        content: string;
        commentCount: number;
        likedCount: number;
        thumbnailId: string;
        tags: string[];
        user: {
            username: string;
            name: string;
        };
    }[]>;
    createPost(dto: CreatePostDTO, username: string): Promise<{
        message: string;
    }>;
    deletePost(dto: DeletePostDTO, username: string): Promise<{
        message: string;
    }>;
    updatePost(dto: UpdatePostDTO, username: string): Promise<{
        message: string;
    }>;
    getUsersPosts(username: string): Promise<{
        title: string;
        content: string;
        commentCount: number;
        likedCount: number;
        thumbnailId: string;
        tags: string[];
    }[]>;
    getPostById(postId: string): Promise<any>;
}
