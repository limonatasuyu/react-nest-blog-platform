import { NotificationService } from './notification.service';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(req: any): Promise<(({
        count: number;
        lastPerson: {
            firstname: string;
            lastname: string;
            profilePictureId?: string;
        };
        targetHref: string;
        isLookedAt: boolean;
        isSeen: boolean;
        notificationIds: string[];
        passedTime: string;
    } & {
        type: "like";
    }) | ({
        count: number;
        lastPerson: {
            firstname: string;
            lastname: string;
            profilePictureId?: string;
        };
        targetHref: string;
        isLookedAt: boolean;
        isSeen: boolean;
        notificationIds: string[];
        passedTime: string;
    } & {
        type: "comment";
        commentContent: string;
        thumbnailId?: string;
    }) | ({
        count: number;
        lastPerson: {
            firstname: string;
            lastname: string;
            profilePictureId?: string;
        };
        targetHref: string;
        isLookedAt: boolean;
        isSeen: boolean;
        notificationIds: string[];
        passedTime: string;
    } & {
        type: "answer";
        commentContent: string;
        answerContent: string;
        postTitle: string;
        thumbnailId?: string;
    }) | {
        firstname: string;
        lastname: string;
        username: string;
        profilePictureId?: string;
        notificationId: string;
        isLookedAt: boolean;
        isSeen: boolean;
        targetHref: string;
        passedTime: string;
    })[]>;
    seeNotification(req: any, { notificationIds }: {
        notificationIds: any;
    }): Promise<{
        message: string;
    }>;
    lookAtNotifications(req: any, { notificationIds }: {
        notificationIds: string[];
    }): Promise<{
        message: string;
    }>;
}
