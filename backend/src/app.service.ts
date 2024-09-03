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
    const posts = await this.postService.getSearchResults(page, keyword);
    const users = await this.userService.getSearchResults(page, keyword);

    return { posts, users };
  }
}
