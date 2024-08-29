import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { Comment } from 'src/schemes/comment.schema';
import { AddCommentDTO, DeleteCommentDTO } from 'src/dto/comment-dto';
import { ObjectId } from 'bson';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentsModel: Model<Comment>,
    @InjectModel(Post.name) private postsModel: Model<Post>,
    private notificationService: NotificationService,
  ) {}

  async addComment(dto: AddCommentDTO, userId: string) {
    const commentId = new ObjectId();
    const createdComment = await this.commentsModel.create({
      _id: commentId,
      content: dto.content,
      user: userId,
      answerTo: dto.answeredCommentId,
      createdAt: new Date(),
      post: dto.postId,
    });

    if (!createdComment) {
      throw new InternalServerErrorException();
    }

    const updatedPost = await this.postsModel.findOneAndUpdate(
      { _id: dto.postId },
      {
        $push: { comments: createdComment },
      },
      {
        projection: {
          user: 1,
        },
      },
    );

    if (!updatedPost) {
      throw new InternalServerErrorException();
    }

    await this.notificationService.createNotification({
      type: 'comment',
      createdBy: userId,
      createdFor: updatedPost.user as unknown as string,
      relatedPost: dto.postId,
      relatedComment: createdComment._id as unknown as string,
    });

    if (
      dto.answeredCommentId &&
      updatedPost.user._id !== createdComment.answerTo.user._id
    ) {
      await this.notificationService.createNotification({
        type: 'answer',
        createdBy: userId,
        createdFor: createdComment.answerTo.user._id as unknown as string,
        relatedPost: dto.postId,
        relatedComment: createdComment._id as unknown as string,
        answeredComment: dto.answeredCommentId,
      });
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

  async likeComment(commentId: string, user_id: string) {
    const updatedComment = await this.commentsModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(commentId) },
      [
        {
          $set: {
            likedBy: {
              $cond: [
                { $in: [new mongoose.Types.ObjectId(user_id), '$likedBy'] },
                {
                  $setDifference: [
                    '$likedBy',
                    [new mongoose.Types.ObjectId(user_id)],
                  ],
                },
                {
                  $concatArrays: [
                    '$likedBy',
                    [new mongoose.Types.ObjectId(user_id)],
                  ],
                },
              ],
            },
          },
        },
      ],
      {
        projection: {
          user: 1,
          post: 1,
          answerTo: 1,
        },
      },
    );
    if (!updatedComment) {
      throw new InternalServerErrorException();
    }

    await this.notificationService.createNotification({
      type: 'comment',
      createdBy: user_id,
      createdFor: updatedComment.user as unknown as string,
      relatedPost: updatedComment.post as unknown as string,
      relatedComment: updatedComment.answerTo as unknown as string,
    });

    return { message: 'Operation handled successfully' };
  }

  async getByPage(page: number, commentIds: string[]) {
    const comments = await this.commentsModel
      .find({ _id: { $in: commentIds } }, 'content')
      .sort({ createdAt: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .populate({
        path: 'user',
        select: 'username firstname lastname',
      })
      .exec();

    const answers = await this.commentsModel.aggregate([
      {
        $match: { answerTo: { $in: commentIds } },
      },
      {
        $sort: { createdAt: 1 }, // Sort by createdAt in ascending order (oldest first)
      },
      {
        $group: {
          _id: '$answerTo',
          answer: { $first: '$$ROOT' }, // Get the first document in each group (oldest due to sorting)
        },
      },
      {
        $lookup: {
          from: 'users', // The collection to join with
          localField: 'answer.user', // The field from the comments collection
          foreignField: '_id', // The field from the users collection
          as: 'userDetails', // The name of the field to add the joined data to
        },
      },
      {
        $unwind: '$userDetails', // Unwind the array to de-nest the user details
      },
      {
        $project: {
          'answer._id': 1,
          'answer.content': 1,
          'answer.createdAt': 1,
          'userDetails.firstname': 1, // Select specific fields to include in the result
          'userDetails.lastname': 1,
          'userDetails.username': 1,
        },
      },
    ]);

    return [...answers, ...comments];
  }
}
