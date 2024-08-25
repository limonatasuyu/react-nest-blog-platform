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

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @UseGuards(CommentsGuard)
  @Post()
  async addComment(@Req() req, @Body() dto: AddCommentDTO) {
    return await this.commentsService.addComment(dto, req.user.sub);
  }

  @UseGuards(CommentsGuard)
  @Delete()
  async deleteComment(@Query() dto: DeleteCommentDTO) {
    return await this.commentsService.deleteComment(dto);
  }

  @UseGuards(CommentsGuard)
  @Get(':id/like')
  async likeComment(@Req() req, @Param('id') commentId: string) {
    return await this.commentsService.likeComment(commentId, req.user.sub);
  }
}

