import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Req() req) {
    return await this.notificationService.getNotifications(req.user.sub);
  }

  @Post('see')
  async seeNotification(@Req() req, @Body() { notificationIds }) {
    return await this.notificationService.seeNotifications(
      notificationIds,
      req.user.sub,
    );
  }

  @Post('look')
  async lookAtNotifications(
    @Req() req,
    @Body() { notificationIds }: { notificationIds: string[] },
  ) {
    return await this.notificationService.lookToNotifications(
      notificationIds,
      req.user.sub,
    );
  }
}
