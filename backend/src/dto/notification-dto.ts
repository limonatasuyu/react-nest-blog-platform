export interface CreateNotificationDTO {
  type: 'comment' | 'follow' | 'like' | 'answer';
  createdBy: string;
  createdFor: string;
  relatedPost: string;
  relatedComment?: string;
  answeredComment?: string;
}
