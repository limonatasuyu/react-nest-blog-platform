import { ImageService } from './image.service';
import { Response } from 'express';
export declare class ImageController {
    private readonly imageService;
    constructor(imageService: ImageService);
    uploadImage(req: any, file: Express.Multer.File): Promise<{
        imageId: string;
    }>;
    getImage(imageId: string, res: Response): Promise<void>;
}
