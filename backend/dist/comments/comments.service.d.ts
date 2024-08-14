import { Model } from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { Comment } from 'src/schemes/comment.schema';
import { AddCommentDTO, DeleteCommentDTO } from 'src/dto/comment-dto';
export declare class CommentsService {
    private commentsModel;
    private postsModel;
    constructor(commentsModel: Model<Comment>, postsModel: Model<Post>);
    addComment(dto: AddCommentDTO, userId: string): Promise<{
        message: string;
    }>;
    deleteComment(dto: DeleteCommentDTO): Promise<{
        message: string;
    }>;
    findCommentByCommentIdAndUserId(commentId: string, userId: string): Promise<import("mongoose").Document<unknown, {}, Comment> & Comment & Required<{
        _id: string;
    }>>;
}
