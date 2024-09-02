import { TagService } from './tag/tag.service';
import { UsersService } from './user/user.service';
export declare class AppService {
    private tagService;
    private userService;
    constructor(tagService: TagService, userService: UsersService);
    getRecommended(): Promise<{
        tags: (import("mongoose").Document<unknown, {}, import("./schemes/tag.schema").Tag> & import("./schemes/tag.schema").Tag & Required<{
            _id: import("mongoose").Schema.Types.ObjectId;
        }>)[];
        users: any[];
    }>;
}
