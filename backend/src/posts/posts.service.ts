import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postsModel: Model<Post>,
    private usersService: UsersService,
  ) {}

  async getPostByIdAndUser(postId: string, user_id: string) {
    return await this.postsModel.findOne({ _id: postId, user: user_id });
  }

  async getPostsByTag(dto: GetPostsByTagDTO) {
    const posts = await this.postsModel
      .find({ tags: { $in: dto.tags } })
      .limit(10)
      .skip((dto.page - 1) * 10)
      .exec();

    if (!posts) {
      throw new InternalServerErrorException();
    }
    return posts;
  }

  async getRecentPosts(dto: GetRecentPostsDTO) {
    const posts = await this.postsModel
      .find()
      .limit(10)
      .skip((dto.page - 1) * 10)
      .sort({ createdAt: -1 })
      .exec();
    if (!posts) {
      throw new InternalServerErrorException();
    }
    return posts;
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
      imageIds: dto.imageDataUrls,
      user: user,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!createdPost) {
      throw new InternalServerErrorException();
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
        imageIds: dto.imageDataUrls,
        updatedAt: new Date(),
      },
    );

    if (!updatedPost) {
      throw new InternalServerErrorException();
    }

    return { message: 'Post updated successfully' };
  }
}
