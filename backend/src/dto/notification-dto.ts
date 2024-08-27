export interface CreateNotificationDTO {
  type: 'comment' | 'follow' | 'like';
  createdBy: string;
  createdFor: string;
  relatedPost: string;
  relatedComment?: string;
}
