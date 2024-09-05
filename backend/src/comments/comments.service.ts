import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post } from '../schemes/post.schema';
import { Comment } from '../schemes/comment.schema';
import { AddCommentDTO, DeleteCommentDTO } from 'src/dto/comment-dto';
import { NotificationService } from '../notification/notification.service';
import { UsersService } from '../user/user.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentsModel: Model<Comment>,
    @InjectModel(Post.name) private postsModel: Model<Post>,
    private notificationService: NotificationService,
    private usersService: UsersService,
  ) {}

  async addComment(dto: AddCommentDTO, userId: string) {
    const commentId = new mongoose.Types.ObjectId();

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

    if (dto.ownerCommentId) {
      await this.commentsModel.updateOne(
        { _id: dto.ownerCommentId },
        { $push: { answers: commentId } },
      );
    }

    const updatedPost = await this.postsModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(dto.postId) },
      {
        $push: { comments: commentId },
      },
      {
        new: true,
        select: 'user',
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

    return { commentId };
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
    const user = await this.usersService.getById(user_id);
    if (!user) throw new InternalServerErrorException();
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
    const answerPageSize = 2;
    const answers = await this.commentsModel
      .find({
        answerTo: commentId,
      })
      .sort({ createdAt: -1 })
      .skip(page * answerPageSize) // first page is going to be already received after comment fetch (look at the method below)
      .limit(answerPageSize)
      .populate('content answerTo createdAt')
      .populate({
        path: 'user',
        select: 'firstname lastname username profilePictureId',
      });

    return answers;
  }

  async getByPostId(page: number, postId: string) {
    const pageSize = 10;
    const answerPageSize = 2;

    const comments = await this.commentsModel.aggregate([
      {
        $match: {
          post: new mongoose.Types.ObjectId(postId),
          answerTo: undefined,
        },
      },
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
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'answerTo',
          as: 'answers',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'answers.user',
          foreignField: '_id',
          as: 'answerUsers',
        },
      },
      {
        $addFields: {
          answers: {
            $map: {
              input: { $ifNull: ['$answers', []] },
              as: 'answer',
              in: {
                _id: '$$answer._id',
                content: '$$answer.content',
                answerTo: '$$answer.answerTo',
                createdAt: '$$answer.createdAt',
                user: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$answerUsers',
                        as: 'user',
                        cond: { $eq: ['$$user._id', '$$answer.user'] },
                      },
                    },
                    0,
                  ],
                },
                likedCount: { $size: { $ifNull: ['$$answer.likedBy', []] } },
              },
            },
          },
        },
      },
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
          likedCount: { $size: { $ifNull: ['$likedBy', []] } },
          answerPageCount: {
            $ceil: { $divide: [{ $size: '$answers' }, answerPageSize] },
          },
          answers: { $slice: ['$answers', answerPageSize] },
        },
      },
      {
        $facet: {
          comments: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
          ],
          totalRecordCount: [{ $count: 'count' }],
        },
      },
      {
        $addFields: {
          totalPageCount: {
            $ifNull: [
              {
                $ceil: {
                  $divide: [
                    { $arrayElemAt: ['$totalRecordCount.count', 0] },
                    pageSize,
                  ],
                },
              },
              1,
            ],
          },
        },
      },
    ]);

    return comments[0] ?? { comments: [], totalPageCount: 1 };
  }
}
