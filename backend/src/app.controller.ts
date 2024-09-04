import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('recommended')
  async getHello() {
    return await this.appService.getRecommended();
  }

  @Get('search')
  async getResults(@Query() { page, keyword }) {
    return this.appService.getSearchResults(page, keyword);
  }
}
