import { PostsService } from './posts.service';
import { GetPostsByTagDTO, GetRecentPostsDTO, CreatePostDTO, UpdatePostDTO } from '../dto/post-dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    getPosts({ page }: {
        page: any;
    }): Promise<any[]>;
    getPostsByTags({ tag, page }: GetPostsByTagDTO): Promise<any[]>;
    getRecentPosts({ page }: GetRecentPostsDTO): Promise<any[]>;
    likePost(req: any, postId: string): Promise<{
        message: string;
    }>;
    savePost(req: any, postId: string): Promise<{
        message: string;
    }>;
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
    getMyPosts(req: any): Promise<any[]>;
    getPost(req: any, postId: string): Promise<any>;
}
