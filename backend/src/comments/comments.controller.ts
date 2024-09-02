import {
  Controller,
  Post,
  Body,
  Delete,
  Query,
  UseGuards,
  Req,
  Param,
  Get,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AddCommentDTO, DeleteCommentDTO } from 'src/dto/comment-dto';
import { CommentsGuard } from './comments.guard';

@UseGuards(CommentsGuard)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  async getComments(@Query() { page, postId }) {
    return await this.commentsService.getByPostId(page, postId);
  }

  @Get('answers')
  async getAnswers(@Query() { page, commentId }) {
    return await this.commentsService.getAnswers(page, commentId);
  }

  @Get('like/:id')
  async likeComment(@Req() req, @Param('id') commentId: string) {
    return await this.commentsService.likeComment(commentId, req.user.sub);
  }

  @Post()
  async addComment(@Req() req, @Body() dto: AddCommentDTO) {
    return await this.commentsService.addComment(dto, req.user.sub);
  }

  @Delete()
  async deleteComment(@Query() dto: DeleteCommentDTO) {
    return await this.commentsService.deleteComment(dto);
  }
}
