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
  Param,
  NotImplementedException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { GetPostsDTO, CreatePostDTO, UpdatePostDTO } from '../dto/post-dto';
import { PostsGuard } from './posts.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(PostsGuard)
  @Get()
  getPosts(@Query() dto: GetPostsDTO) {
    return this.postsService.getPosts(dto);
  }

  @UseGuards(PostsGuard)
  @Get(':id')
  async getPost(@Req() req, @Param('id') postId: string) {
    return this.postsService.getPostById(postId, req.user.sub);
  }

  @UseGuards(PostsGuard)
  @Get('like/:id')
  likePost(@Req() req, @Param('id') postId: string) {
    return this.postsService.likePost(postId, req.user.sub);
  }

  @UseGuards(PostsGuard)
  @Get('save/:id')
  savePost(@Req() req, @Param('id') postId: string) {
    return this.postsService.savePost(postId, req.user.sub);
  }

  @UseGuards(PostsGuard)
  @Post('report/:id')
  reportPost(/*@Req() req, @Param('id') postId: string*/) {
    throw new NotImplementedException();
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
