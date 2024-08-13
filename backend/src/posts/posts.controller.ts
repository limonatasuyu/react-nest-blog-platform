import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  GetPostsByTagDTO,
  GetRecentPostsDTO,
  CreatePostDTO,
  UpdatePostDTO,
} from '../dto/post-dto';
import { PostsGuard } from './posts.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('tag')
  getPostsByTags(@Query() { tags, page }: GetPostsByTagDTO) {
    return this.postsService.getPostsByTag({ tags, page });
  }

  @Get('recent')
  getRecentPosts(@Query() { page }: GetRecentPostsDTO) {
    return this.postsService.getRecentPosts({ page });
  }

  @UseGuards(PostsGuard)
  @Post()
  createPost(@Req() req, @Body() dto: CreatePostDTO) {
    return this.postsService.createPost(dto, req.user.username);
  }

  @UseGuards(PostsGuard)
  @Delete()
  deletePost(@Req() req, @Query('post_id') postId) {
    return this.postsService.deletePost({ postId }, req.user.username);
  }

  @UseGuards(PostsGuard)
  @Put()
  updatePost(
    @Req() req,
    @Query('post_id') postId,
    @Body() body: UpdatePostDTO & { postId: undefined },
  ) {
    return this.postsService.updatePost(
      { ...(body as any), postId },
      req.user.username,
    );
  }
}
