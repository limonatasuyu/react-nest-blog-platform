import { CommentsService } from './comments.service';
import { AddCommentDTO, DeleteCommentDTO } from 'src/dto/comment-dto';
export declare class CommentsController {
    private commentsService;
    constructor(commentsService: CommentsService);
    addComment(req: any, dto: AddCommentDTO): Promise<{
        message: string;
    }>;
    deleteComment(dto: DeleteCommentDTO): Promise<{
        message: string;
    }>;
}
