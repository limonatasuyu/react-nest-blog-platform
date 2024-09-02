import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): Promise<{
        tags: (import("mongoose").Document<unknown, {}, import("./schemes/tag.schema").Tag> & import("./schemes/tag.schema").Tag & Required<{
            _id: import("mongoose").Schema.Types.ObjectId;
        }>)[];
        users: any[];
    }>;
}
