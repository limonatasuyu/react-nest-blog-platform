export interface AddCommentDTO {
  postId: string;
  content: string;
  userId: string;
  answeredCommentId?: string;
}
