import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TagService } from './tag/tag.service';
import { UsersService } from './user/user.service';
import { PostsService } from './posts/posts.service';

@Injectable()
export class AppService {
  constructor(
    private tagService: TagService,
    private userService: UsersService,
    private postService: PostsService,
  ) {}

  async getRecommended() {
    const tags = await this.tagService.getPopularTags();
    const users = await this.userService.getRecommendedUsers();

    if (!tags || !users) {
      throw new InternalServerErrorException();
    }

    return { tags, users };
  }

  async getSearchResults(page: number, keyword: string) {
    const postsData = await this.postService.getSearchResults(page, keyword);
    const usersData = await this.userService.getSearchResults(page, keyword);

    if (!postsData || !usersData) throw new InternalServerErrorException();
    return { postsData, usersData };
  }
}
