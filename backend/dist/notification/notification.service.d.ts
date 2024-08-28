import { Notification } from '../schemes/notification.scheme';
import { Model } from 'mongoose';
import { CreateNotificationDTO } from 'src/dto/notification-dto';
export declare class NotificationService {
    private notificationModel;
    constructor(notificationModel: Model<Notification>);
    createNotification(dto: CreateNotificationDTO): Promise<{
        message: string;
    }>;
    getNotifications(userId: string): Promise<any[]>;
    markNotification(notificationId: string, userId: string): Promise<{
        message: string;
    }>;
}
