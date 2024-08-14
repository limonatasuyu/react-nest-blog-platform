import { PostsService } from './posts.service';
import { GetPostsByTagDTO, GetRecentPostsDTO, CreatePostDTO, UpdatePostDTO } from '../dto/post-dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    getPostsByTags({ tags, page }: GetPostsByTagDTO): Promise<(import("mongoose").Document<unknown, {}, import("../schemes/post.schema").Post> & import("../schemes/post.schema").Post & Required<{
        _id: string;
    }>)[]>;
    getRecentPosts({ page }: GetRecentPostsDTO): Promise<(import("mongoose").Document<unknown, {}, import("../schemes/post.schema").Post> & import("../schemes/post.schema").Post & Required<{
        _id: string;
    }>)[]>;
    createPost(req: any, dto: CreatePostDTO): Promise<{
        message: string;
    }>;
    deletePost(req: any, postId: any): Promise<{
        message: string;
    }>;
    updatePost(req: any, postId: any, body: UpdatePostDTO & {
        postId: undefined;
    }): Promise<{
        message: string;
    }>;
}
