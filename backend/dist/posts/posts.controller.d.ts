import { PostsService } from './posts.service';
import { GetPostsByTagDTO, GetRecentPostsDTO, CreatePostDTO, UpdatePostDTO } from '../dto/post-dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    getPosts({ page }: {
        page: any;
    }): Promise<any[]>;
    getPostsByTags({ tags, page }: GetPostsByTagDTO): Promise<{
        title: string;
        content: string;
        commentCount: number;
        likedCount: number;
        thumbnailId: string;
        tags: import("../schemes/tag.schema").Tag[];
        user: {
            username: string;
            name: string;
        };
    }[]>;
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
    getMyPosts(req: any): Promise<{
        title: string;
        content: string;
        commentCount: number;
        likedCount: number;
        thumbnailId: string;
        tags: import("../schemes/tag.schema").Tag[];
    }[]>;
    getPost(req: any, postId: string): Promise<any>;
}
