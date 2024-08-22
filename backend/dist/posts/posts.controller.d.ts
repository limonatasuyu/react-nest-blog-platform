import { PostsService } from './posts.service';
import { GetPostsByTagDTO, GetRecentPostsDTO, CreatePostDTO, UpdatePostDTO } from '../dto/post-dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    getPosts({ page }: {
        page: any;
    }): Promise<{
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
    getPostsByTags({ tags, page }: GetPostsByTagDTO): Promise<{
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
    getRecentPosts({ page }: GetRecentPostsDTO): Promise<{
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
        tags: string[];
    }[]>;
    getPost(postId: string): Promise<any>;
}
