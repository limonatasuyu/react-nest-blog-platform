export interface AddCommentDTO {
  postId: string;
  content: string;
  answeredCommentId?: string;
}

export interface DeleteCommentDTO {
  postId: string;
  commentId: string;
}
