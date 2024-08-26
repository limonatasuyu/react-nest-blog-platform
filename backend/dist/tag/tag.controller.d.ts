import { TagService } from './tag.service';
export declare class TagController {
    private tagservice;
    constructor(tagservice: TagService);
    getPopularTags(): Promise<(import("mongoose").Document<unknown, {}, import("../schemes/tag.schema").Tag> & import("../schemes/tag.schema").Tag & Required<{
        _id: import("mongoose").Schema.Types.ObjectId;
    }>)[]>;
}
