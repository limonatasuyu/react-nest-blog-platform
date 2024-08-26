import mongoose, { Model } from 'mongoose';
import { Tag } from 'src/schemes/tag.schema';
export declare class TagService {
    private tagModel;
    constructor(tagModel: Model<Tag>);
    getPopularTags(): Promise<(mongoose.Document<unknown, {}, Tag> & Tag & Required<{
        _id: mongoose.Schema.Types.ObjectId;
    }>)[]>;
    createTag(tagName: string): Promise<{
        message: string;
    }>;
    createTagsForPost(tags: string[]): Promise<(mongoose.Document<unknown, {}, Tag> & Tag & Required<{
        _id: mongoose.Schema.Types.ObjectId;
    }>)[]>;
}
