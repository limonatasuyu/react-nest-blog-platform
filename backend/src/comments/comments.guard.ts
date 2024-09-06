import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CommentsService } from './comments.service';

@Injectable()
export class CommentsGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private commentsService: CommentsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    if (request.method === 'POST' || request.method === 'GET') return true;

    const commentId = this.getCommentIdFromQuery(request);
    if (!commentId) {
      throw new InternalServerErrorException('Could not find the comment.');
    }

    const comment = await this.commentsService.findCommentByCommentIdAndUserId(
      commentId,
      request.user.payload.sub,
    );

    if (!comment) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getCommentIdFromQuery(request: Request): string | undefined {
    return request.query.commentId as string | undefined;
  }
}
