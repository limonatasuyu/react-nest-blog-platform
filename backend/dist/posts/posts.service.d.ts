import { Model } from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { UsersService } from 'src/user/user.service';
import { GetPostsByTagDTO, GetRecentPostsDTO, CreatePostDTO, DeletePostDTO, UpdatePostDTO } from '../dto/post-dto';
export declare class PostsService {
    private postsModel;
    private usersService;
    constructor(postsModel: Model<Post>, usersService: UsersService);
    getPostByIdAndUser(postId: string, user_id: string): Promise<import("mongoose").Document<unknown, {}, Post> & Post & Required<{
        _id: string;
    }>>;
    getPostsByTag(dto: GetPostsByTagDTO): Promise<(import("mongoose").Document<unknown, {}, Post> & Post & Required<{
        _id: string;
    }>)[]>;
    getRecentPosts(dto: GetRecentPostsDTO): Promise<(import("mongoose").Document<unknown, {}, Post> & Post & Required<{
        _id: string;
    }>)[]>;
    createPost(dto: CreatePostDTO, username: string): Promise<{
        message: string;
    }>;
    deletePost(dto: DeletePostDTO, username: string): Promise<{
        message: string;
    }>;
    updatePost(dto: UpdatePostDTO, username: string): Promise<{
        message: string;
    }>;
}
