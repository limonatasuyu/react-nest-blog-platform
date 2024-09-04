import { TagService } from './tag/tag.service';
import { UsersService } from './user/user.service';
import { PostsService } from './posts/posts.service';
export declare class AppService {
    private tagService;
    private userService;
    private postService;
    constructor(tagService: TagService, userService: UsersService, postService: PostsService);
    getRecommended(): Promise<{
        tags: (import("mongoose").Document<unknown, {}, import("./schemes/tag.schema").Tag> & import("./schemes/tag.schema").Tag & Required<{
            _id: import("mongoose").Schema.Types.ObjectId;
        }>)[];
        users: any[];
    }>;
    getSearchResults(page: number, keyword: string): Promise<{
        postsData: any;
        usersData: any;
    }>;
}
