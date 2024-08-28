import { NotificationService } from './notification.service';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(req: any): Promise<any[]>;
    markNotification(req: any, { notificationId }: {
        notificationId: any;
    }): Promise<{
        message: string;
    }>;
}
