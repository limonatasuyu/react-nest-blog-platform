import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { UsersService } from 'src/user/user.service';
import {
  GetPostsByTagDTO,
  GetRecentPostsDTO,
  CreatePostDTO,
  DeletePostDTO,
  UpdatePostDTO,
} from '../dto/post-dto';
import { ObjectId } from 'bson';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postsModel: Model<Post>,
    private usersService: UsersService,
    private imageService: ImageService,
  ) {}

  async getPostByIdAndUser(postId: string, user_id: string) {
    return await this.postsModel.findOne({ _id: postId, user: user_id });
  }

  async getPostsByTag(dto: GetPostsByTagDTO) {
    const posts = await this.postsModel
      .find({ tags: { $in: dto.tags } })
      .limit(10)
      .skip((dto.page - 1) * 10)
      .populate({
        path: 'user',
        select: 'username firstname lastname',
      })
      .exec();

    if (!posts) {
      throw new InternalServerErrorException();
    }
    return posts.map((i) => ({
      title: i.title,
      content: i.content,
      commentCount: i.comments.length,
      likedCount: i.likedBy.length,
      thumbnailId: i.thumbnailId,
      tags: i.tags,
      user: {
        username: i.user.username,
        name: i.user.firstname + ' ' + i.user.lastname,
      },
    }));
  }

  async getRecentPosts(dto: GetRecentPostsDTO) {
    const posts = await this.postsModel
      .find()
      .limit(10)
      .skip((dto.page - 1) * 10)
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'username firstname lastname',
      })
      .exec();
    if (!posts) {
      throw new InternalServerErrorException();
    }
    return posts.map((i) => ({
      id: i._id,
      title: i.title,
      content: i.content,
      commentCount: i.comments.length,
      likedCount: i.likedBy.length,
      thumbnailId: i.thumbnailId,
      tags: i.tags,
      user: {
        username: i.user.username,
        name: i.user.firstname + ' ' + i.user.lastname,
      },
    }));
  }

  async createPost(dto: CreatePostDTO, username: string) {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new InternalServerErrorException();
    }

    const createdPost = await this.postsModel.create({
      _id: new ObjectId(),
      title: dto.title,
      content: dto.content,
      thumbnailId: dto.thumbnailId,
      user: user,
      tags: dto.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!createdPost) {
      throw new InternalServerErrorException();
    }

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

  async getUsersPosts(username: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new InternalServerErrorException();
    }

    const posts = await this.postsModel.find({ user: user._id });

    if (!posts) {
      throw new InternalServerErrorException();
    }

    return posts.map((i) => ({
      title: i.title,
      content: i.content,
      commentCount: i.comments.length,
      likedCount: i.likedBy.length,
      thumbnailId: i.thumbnailId,
      tags: i.tags,
    }));
  }
  async getPostById(postId: string) {
    const post = await this.postsModel.aggregate([
      // Match the post by its ID
      { $match: { _id: postId } },
      // Lookup the comments related to the post
      {
        $lookup: {
          from: 'comments',
          localField: 'comments',
          foreignField: '_id',
          as: 'comments',
        },
      },
    ]);

    if (!post || post.length === 0)
      throw new InternalServerErrorException('Could not find the post');

    return post[0];
  }
}
