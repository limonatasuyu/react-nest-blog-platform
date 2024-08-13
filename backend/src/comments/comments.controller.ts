import { Controller, Post } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  async addComment(@Body() dto: AddCommentDTO) {
    return this.commentsService.addComment(dto)
  }
}
