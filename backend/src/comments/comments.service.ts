import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { Comment } from 'src/schemes/comment.schema';
import { AddCommentDTO } from 'src/dto/comment-dto';
import { ObjectId } from 'bson';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentsModel: Model<Comment>,
    @InjectModel(Post.name) private postsModel: Model<Post>,
  ) {}

  addComment(dto: AddCommentDTO, userId: string) {
    const commentId = new ObjectId();
    const createdComment = this.commentsModel.create({
      _id: commentId,
      content: dto.content,
      user: userId,
      answerTo: dto.answeredCommentId,
    });

    if (!createdComment) {
      throw new InternalServerErrorException();
    }

    this.postsModel.updateOne(
      { _id: dto.postId },
      {
        $push: { commentIds: commentId },
      },
    );
  }
}
