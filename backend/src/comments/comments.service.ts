import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { Comment } from 'src/schemes/comment.schema';
import { AddCommentDTO, DeleteCommentDTO } from 'src/dto/comment-dto';
import { ObjectId } from 'bson';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentsModel: Model<Comment>,
    @InjectModel(Post.name) private postsModel: Model<Post>,
  ) {}

  async addComment(dto: AddCommentDTO, userId: string) {
    const commentId = new ObjectId();
    const createdComment = await this.commentsModel.create({
      _id: commentId,
      content: dto.content,
      user: userId,
      answerTo: dto.answeredCommentId,
    });

    if (!createdComment) {
      throw new InternalServerErrorException();
    }

    const updatePostResult = await this.postsModel.updateOne(
      { _id: dto.postId },
      {
        $push: { commentIds: commentId },
      },
    );

    if (!updatePostResult) {
      throw new InternalServerErrorException();
    }

    return { message: 'comment created successfully' };
  }

  async deleteComment(dto: DeleteCommentDTO) {
    const updatePostResult = await this.postsModel.updateOne(
      { _id: dto.postId },
      { $pull: { commentIds: dto.commentId } },
    );

    if (!updatePostResult) {
      throw new InternalServerErrorException();
    }

    const deleteResult = await this.commentsModel.deleteOne({
      _id: dto.commentId,
    });

    if (!deleteResult) {
      throw new InternalServerErrorException();
    }

    return { message: 'comment deleted successfully' };
  }

  async findCommentByCommentIdAndUserId(commentId: string, userId: string) {
    return await this.commentsModel.findOne({ _id: commentId, user: userId });
  }
}
