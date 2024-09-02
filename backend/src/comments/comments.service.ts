import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { Comment } from 'src/schemes/comment.schema';
import { AddCommentDTO, DeleteCommentDTO } from 'src/dto/comment-dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentsModel: Model<Comment>,
    @InjectModel(Post.name) private postsModel: Model<Post>,
    private notificationService: NotificationService,
  ) {}

  async addComment(dto: AddCommentDTO, userId: string) {
    const createdComment = await this.commentsModel.create({
      _id: new mongoose.Types.ObjectId(),
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

    const answeredComment = await this.commentsModel.findOne({
      _id: dto.answeredCommentId,
    });

    if (dto.answeredCommentId && updatedPost.user !== answeredComment.user) {
      await this.notificationService.createNotification({
        type: 'answer',
        createdBy: userId,
        createdFor: answeredComment.user as unknown as string,
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

  async getAnswers(page: number, commentId: string) {
    const answers = await this.commentsModel
      .find({
        answerTo: commentId,
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .skip(page * 10) // first page is going to be already received after comment fetch (look at the method below)
      .populate('content answerTo createdAt')
      .populate({
        path: 'user',
        select: 'firstname lastname username profilePictureId',
      });

    return answers;
  }

  async getByPostId(page: number, postId: string) {
    const pageSize = 10;

    const comments = await this.commentsModel.aggregate([
      { $match: { post: postId, answerTo: undefined } },
      //{ $unwind: '$answers' },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $facet: {
          comments: [
            {
              $project: {
                content: 1,
                createdAt: 1,
                user: {
                  firstname: 1,
                  lastname: 1,
                  username: 1,
                  profilePictureId: 1,
                },
                likedCount: { $size: '$likedBy' },
                answers: {
                  $slice: [
                    {
                      $map: {
                        input: {
                          $sortArray: {
                            input: '$answers',
                            sortBy: { createdAt: -1 },
                          },
                        },
                        as: 'answer',
                        in: {
                          content: '$$answer.content',
                          answerTo: '$$answer.answerTo',
                          createdAt: '$$answer.createdAt',
                          user: {
                            firstname: '$$answer.user.firstname',
                            lastname: '$$answer.user.lastname',
                            username: '$$answer.user.username',
                            profilePictureId: '$$answer.user.profilePictureId',
                          },
                          likedCount: { $size: '$$answer.likedBy' },
                        },
                      },
                    },
                    10,
                  ],
                },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            { $limit: pageSize },
            { $skip: (page - 1) * pageSize },
          ],
          totalRecordCount: [{ $count: 'count' }],
        },
      },
      {
        $addFields: {
          totalPageCount: {
            $ceil: {
              $divide: [
                { $arrayElemAt: ['$totalRecordCount.count', 0] },
                pageSize,
              ],
            },
          },
        },
      },
    ]);
    return comments[0];
  }
}
