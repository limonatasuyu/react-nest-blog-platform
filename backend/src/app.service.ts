import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TagService } from './tag/tag.service';
import { UsersService } from './user/user.service';

@Injectable()
export class AppService {
  constructor(
    private tagService: TagService,
    private userService: UsersService,
  ) {}

  async getRecommended() {
    const tags = await this.tagService.getPopularTags();
    const users = await this.userService.getRecommendedUsers();

    if (!tags || !users) {
      throw new InternalServerErrorException();
    }

    return { tags, users };
  }
}
