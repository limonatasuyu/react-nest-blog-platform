import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private tagservice: TagService) {}

  @Get()
  async getPopularTags() {
    return await this.tagservice.getPopularTags();
  }
}
