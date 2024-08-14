import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommentsService } from './comments.service';
export declare class CommentsGuard implements CanActivate {
    private jwtService;
    private commentsService;
    constructor(jwtService: JwtService, commentsService: CommentsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
    private getCommentIdFromQuery;
}
