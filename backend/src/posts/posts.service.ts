import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post, PostDocument } from 'src/schemes/post.schema';
import { UsersService } from 'src/user/user.service';
import {
  GetPostsDTO,
  CreatePostDTO,
  DeletePostDTO,
  UpdatePostDTO,
} from '../dto/post-dto';
import { ImageService } from 'src/image/image.service';
import { User } from 'src/schemes/user.schema';
import { TagService } from 'src/tag/tag.service';
import { NotificationService } from 'src/notification/notification.service';

interface PostWithLikeStatus extends PostDocument {
  isUserLiked: boolean;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postsModel: Model<Post>,
    @InjectModel(User.name) private usersModel: Model<User>,
    private usersService: UsersService,
    private imageService: ImageService,
    private tagService: TagService,
    private notificationService: NotificationService,
  ) {}

  async getPostByIdAndUser(postId: string, user_id: string) {
    return await this.postsModel.findOne({ _id: postId, user: user_id });
  }

  async savePost(postId: string, user_id: string) {
    const updatedUser = await this.usersModel.updateOne(
      { _id: new mongoose.Types.ObjectId(user_id) },
      [
        {
          $set: {
            savedPosts: {
              $cond: {
                if: {
                  $in: [new mongoose.Types.ObjectId(postId), '$savedPosts'],
                },
                then: {
                  $filter: {
                    input: '$savedPosts',
                    as: 'post',
                    cond: {
                      $ne: ['$$post', new mongoose.Types.ObjectId(postId)],
                    },
                  },
                },
                else: {
                  $concatArrays: [
                    '$savedPosts',
                    [new mongoose.Types.ObjectId(postId)],
                  ],
                },
              },
            },
          },
        },
      ],
    );

    if (!updatedUser || !updatedUser.modifiedCount) {
      throw new InternalServerErrorException();
    }

    return { message: 'Operation handled successfully.' };
  }

  async likePost(postId: string, user_id: string) {
    const updatedPost =
      await this.postsModel.findOneAndUpdate<PostWithLikeStatus>(
        { _id: postId },
        [
          {
            $set: {
              likedBy: {
                $cond: {
                  if: { $in: [user_id, '$likedBy'] },
                  then: {
                    $filter: {
                      input: '$likedBy',
                      as: 'user',
                      cond: { $ne: ['$$user', user_id] },
                    },
                  },
                  else: { $concatArrays: ['$likedBy', [user_id]] },
                },
              },
            },
          },
        ],
        {
          projection: {
            user: 1,
            isUserLiked: { $in: [user_id, '$likedBy'] },
          },
          new: true,
        },
      );

    if (!updatedPost) {
      throw new InternalServerErrorException();
    }

    if (updatedPost.isUserLiked) {
      await this.notificationService.createNotification({
        type: 'like',
        createdBy: user_id,
        createdFor: updatedPost.user as unknown as string,
        relatedPost: postId,
      });
    }

    return { message: 'Operation handled successfully' };
  }

  async getPosts(dto: GetPostsDTO) {
    const pageSize = 10;

    const ops: mongoose.PipelineStage[] = [
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tagDetails',
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
        $facet: {
          paginatedResults: [
            {
              $project: {
                id: 1,
                title: 1,
                content: 1,
                thumbnailId: 1,
                likedCount: { $size: '$likedBy' },
                commentCount: { $size: '$comments' },
                tags: {
                  $map: { input: '$tagDetails', as: 'tag', in: '$$tag.name' },
                },
                user: {
                  username: 1,
                  firstname: 1,
                  lastname: 1,
                  description: 1,
                },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $skip: (dto.page - 1) * pageSize,
            },
            {
              $limit: pageSize,
            },
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
    ];

    if (dto.tag && dto.tag.toLowerCase() !== 'all' && dto.username) {
      const tag = await this.tagService.findOne(dto.tag);
      const user = await this.usersService.findOne(dto.username);
      ops.unshift({ $match: { tags: { $in: [tag._id] }, user: user._id } });
    } else if (dto.tag && dto.tag.toLowerCase() !== 'all') {
      const tag = await this.tagService.findOne(dto.tag);
      ops.unshift({ $match: { tags: { $in: [tag._id] } } });
    } else if (dto.username) {
      const user = await this.usersService.findOne(dto.username);
      ops.unshift({ $match: { user: user._id } });
    }

    const posts = await this.postsModel.aggregate(ops).exec();

    if (!posts || !posts[0]) {
      throw new InternalServerErrorException();
    }
    return posts[0];
  }

  async createPost(dto: CreatePostDTO, username: string) {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new InternalServerErrorException();
    }

    const createdTags = await this.tagService.createTagsForPost(dto.tags);

    const postId = new mongoose.Types.ObjectId();
    const createdPost = await this.postsModel.create({
      _id: postId,
      title: dto.title,
      content: dto.content,
      thumbnailId: dto.thumbnailId,
      user: user,
      tags: createdTags.map((i) => i._id),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!createdPost) {
      throw new InternalServerErrorException();
    }

    await this.usersModel.updateOne(
      { _id: user._id },
      { $push: { posts: postId } },
    );

    if (dto.thumbnailId) {
      await this.imageService.relateImage(dto.thumbnailId);
    }

    return { message: 'Post created successfully' };
  }

  async deletePost(dto: DeletePostDTO, username: string) {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new InternalServerErrorException();
    }

    const result = await this.postsModel.deleteOne({ _id: dto.postId });

    if (!result) {
      throw new InternalServerErrorException();
    }

    return { message: 'Post deleted successfully' };
  }

  async updatePost(dto: UpdatePostDTO, username: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new InternalServerErrorException();
    }

    const updatedPost = await this.postsModel.updateOne(
      { _id: dto.postId },
      {
        title: dto.title,
        content: dto.content,
        thumbnailId: dto.thumbnailId,
        updatedAt: new Date(),
        tags: dto.tags,
      },
    );

    if (!updatedPost) {
      throw new InternalServerErrorException();
    }

    return { message: 'Post updated successfully' };
  }

  async getPostById(postId: string, user_id: string) {
    const post = await this.postsModel.aggregate([
      { $match: { _id: postId } },
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
          let: { commentsIds: '$comments' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$commentsIds'] } } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
          ],
          as: 'comments',
        },
      },
      {
        $project: {
          thumbnailId: 1,
          title: 1,
          content: 1,
          tags: 1,
          createdAt: 1,
          likedBy: 1,
          user: {
            firstname: 1,
            lastname: 1,
            username: 1,
            profilePictureId: 1,
          },
          comments: {
            $filter: {
              input: {
                $map: {
                  input: '$comments',
                  as: 'comment',
                  in: {
                    _id: '$$comment._id',
                    content: '$$comment.content',
                    createdAt: '$$comment.createdAt',
                    answerTo: '$$comment.answerTo',
                    user: {
                      firstname: '$$comment.user.firstname',
                      lastname: '$$comment.user.lastname',
                      username: '$$comment.user.username',
                      profilePictureId: '$$comment.user.profilePictureId',
                    },
                    likedCount: { $size: '$$comment.likedBy' },
                    isUserLiked: {
                      $in: [
                        new mongoose.Types.ObjectId(user_id),
                        '$$comment.likedBy',
                      ],
                    },
                  },
                },
              },
              as: 'comment',
              cond: { $ne: ['$$comment._id', null] },
            },
          },
        },
      },
    ]);

    if (!post || post.length === 0)
      throw new InternalServerErrorException('Could not find the post');

    const user = await this.usersModel.findOne({
      _id: new mongoose.Types.ObjectId(user_id),
      savedPosts: { $in: [new mongoose.Types.ObjectId(postId)] },
    });

    post[0].isUserSaved = Boolean(user);
    const commentCount = post[0].comments.length;
    const likedCount = post[0].likedBy.length;
    const isUserLiked = Boolean(post[0].likedBy.find((i) => i === user_id));
    post[0].likedBy = undefined;
    const answers = post[0].comments.filter((i) => Boolean(i.answerTo));
    const commentsWithoutAnswers = post[0].comments.filter(
      (i) => !Boolean(i.answerTo),
    );
    const formattedComments = commentsWithoutAnswers.map((i) => ({
      ...i,
      answers: answers.filter((i_) => String(i_.answerTo) === String(i._id)),
    }));
    post[0].comments = formattedComments;

    return { ...post[0], commentCount, likedCount, isUserLiked };
  }
}
