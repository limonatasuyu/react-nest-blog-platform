import { Model } from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { UsersService } from 'src/user/user.service';
import { GetPostsByTagDTO, GetRecentPostsDTO, CreatePostDTO } from '../dto/post-dto';
export declare class PostsService {
    private postsModel;
    private usersService;
    constructor(postsModel: Model<Post>, usersService: UsersService);
    getPostsByTag(dto: GetPostsByTagDTO): Promise<(import("mongoose").Document<unknown, {}, Post> & Post & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getRecentPosts(dto: GetRecentPostsDTO): Promise<(import("mongoose").Document<unknown, {}, Post> & Post & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    createPost(dto: CreatePostDTO, username: string): Promise<import("mongoose").Document<unknown, {}, Post> & Post & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
