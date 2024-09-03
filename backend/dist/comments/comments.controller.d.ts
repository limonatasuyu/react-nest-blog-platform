import { CommentsService } from './comments.service';
import { AddCommentDTO, DeleteCommentDTO } from 'src/dto/comment-dto';
export declare class CommentsController {
    private commentsService;
    constructor(commentsService: CommentsService);
    getComments({ page, postId }: {
        page: any;
        postId: any;
    }): Promise<any>;
    getAnswers({ page, commentId }: {
        page: any;
        commentId: any;
    }): Promise<(import("mongoose").Document<unknown, {}, import("../schemes/comment.schema").Comment> & import("../schemes/comment.schema").Comment & Required<{
        _id: import("mongoose").Schema.Types.ObjectId;
    }>)[]>;
    likeComment(req: any, commentId: string): Promise<{
        message: string;
    }>;
    addComment(req: any, dto: AddCommentDTO): Promise<{
        commentId: import("mongoose").Types.ObjectId;
    }>;
    deleteComment(dto: DeleteCommentDTO): Promise<{
        message: string;
    }>;
}
