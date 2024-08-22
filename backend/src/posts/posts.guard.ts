import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PostsService } from './posts.service';

@Injectable()
export class PostsGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private postsService: PostsService,
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

    const postId = this.getPostIdFromQuery(request);
    if (!postId) {
      throw new UnauthorizedException();
    }

    const post = await this.postsService.getPostByIdAndUser(
      postId,
      request.user.payload.sub,
    );

    if (!post) {
      throw new InternalServerErrorException('Could not find the post');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getPostIdFromQuery(request: Request): string | undefined {
    return request.query.post_id as string | undefined;
  }
}
