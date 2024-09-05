import { Notification } from '../schemes/notification.scheme';
import { Model } from 'mongoose';
import { CreateNotificationDTO } from 'src/dto/notification-dto';
export declare class NotificationService {
    private notificationModel;
    constructor(notificationModel: Model<Notification>);
    createNotification(dto: CreateNotificationDTO, session?: any): Promise<{
        message: string;
    }>;
    getNotifications(userId: string): Promise<(({
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
        id: string;
        lastPerson: {
            firstname: string;
            lastname: string;
            profilePictureId?: string;
        };
        profilePictureId?: string;
        notificationId: string;
        isLookedAt: boolean;
        isSeen: boolean;
        targetHref: string;
        passedTime: string;
        type: "follow";
    })[]>;
    lookToNotifications(notificationIds: string[], userId: string): Promise<{
        message: string;
    }>;
    seeNotifications(notificationIds: string[], userId: string): Promise<{
        message: string;
    }>;
}
