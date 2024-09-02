import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { Comment } from 'src/schemes/comment.schema';
import { AddCommentDTO, DeleteCommentDTO } from 'src/dto/comment-dto';
import { NotificationService } from 'src/notification/notification.service';
export declare class CommentsService {
    private commentsModel;
    private postsModel;
    private notificationService;
    constructor(commentsModel: Model<Comment>, postsModel: Model<Post>, notificationService: NotificationService);
    addComment(dto: AddCommentDTO, userId: string): Promise<{
        message: string;
    }>;
    deleteComment(dto: DeleteCommentDTO): Promise<{
        message: string;
    }>;
    findCommentByCommentIdAndUserId(commentId: string, userId: string): Promise<mongoose.Document<unknown, {}, Comment> & Comment & Required<{
        _id: mongoose.Schema.Types.ObjectId;
    }>>;
    likeComment(commentId: string, user_id: string): Promise<{
        message: string;
    }>;
    getAnswers(page: number, commentId: string): Promise<(mongoose.Document<unknown, {}, Comment> & Comment & Required<{
        _id: mongoose.Schema.Types.ObjectId;
    }>)[]>;
    getByPostId(page: number, postId: string): Promise<any>;
}
