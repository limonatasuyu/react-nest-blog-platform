import { PostsService } from './posts.service';
import { GetPostsDTO, CreatePostDTO, UpdatePostDTO } from '../dto/post-dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    getPosts(dto: GetPostsDTO): Promise<any>;
    getPost(req: any, postId: string): Promise<any>;
    likePost(req: any, postId: string): Promise<{
        message: string;
    }>;
    savePost(req: any, postId: string): Promise<{
        message: string;
    }>;
    reportPost(): void;
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
