import { PostsService } from './posts.service';
import { GetPostsByTagDTO, GetRecentPostsDTO, CreatePostDTO } from '../dto/post-dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    getPostsByTags({ tags, page }: GetPostsByTagDTO): Promise<(import("mongoose").Document<unknown, {}, import("../schemes/post.schema").Post> & import("../schemes/post.schema").Post & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getRecentPosts({ page }: GetRecentPostsDTO): Promise<(import("mongoose").Document<unknown, {}, import("../schemes/post.schema").Post> & import("../schemes/post.schema").Post & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    createPost(req: any, dto: CreatePostDTO): Promise<import("mongoose").Document<unknown, {}, import("../schemes/post.schema").Post> & import("../schemes/post.schema").Post & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
