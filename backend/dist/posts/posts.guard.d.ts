import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PostsService } from './posts.service';
export declare class PostsGuard implements CanActivate {
    private jwtService;
    private postsService;
    constructor(jwtService: JwtService, postsService: PostsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
    private getPostIdFromQuery;
}
