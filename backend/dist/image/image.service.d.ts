import { Image } from '../schemes/images.schema';
import { Model } from 'mongoose';
export declare class ImageService {
    private imagesModel;
    constructor(imagesModel: Model<Image>);
    createImage(file: Express.Multer.File, user_id: string): Promise<{
        imageId: import("mongoose").Schema.Types.ObjectId;
    }>;
    relateImage(imageId: string): Promise<void>;
    getImageWithId(imageId: string): Promise<Buffer>;
    deleteUnUsedImages(): Promise<void>;
}
