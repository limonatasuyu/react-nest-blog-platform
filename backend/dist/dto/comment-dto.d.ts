export interface AddCommentDTO {
    postId: string;
    content: string;
    userId: string;
    answeredCommentId?: string;
}
export interface DeleteCommentDTO {
    postId: string;
    commentId: string;
}
