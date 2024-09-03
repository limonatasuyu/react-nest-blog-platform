export interface AddCommentDTO {
  postId: string;
  content: string;
  answeredCommentId?: string;
  ownerCommentId?: string;
}

export interface DeleteCommentDTO {
  postId: string;
  commentId: string;
}
