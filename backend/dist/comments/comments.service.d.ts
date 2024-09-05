import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post } from '../schemes/post.schema';
import { Comment } from '../schemes/comment.schema';
import { AddCommentDTO, DeleteCommentDTO } from 'src/dto/comment-dto';
import { NotificationService } from '../notification/notification.service';
import { UsersService } from '../user/user.service';
export declare class CommentsService {
    private commentsModel;
    private postsModel;
    private notificationService;
    private usersService;
    constructor(commentsModel: Model<Comment>, postsModel: Model<Post>, notificationService: NotificationService, usersService: UsersService);
    addComment(dto: AddCommentDTO, userId: string): Promise<{
        commentId: mongoose.Types.ObjectId;
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
