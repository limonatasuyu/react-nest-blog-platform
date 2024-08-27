import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Req() req) {
    return await this.notificationService.getNotifications(req.user.sub);
  }

  @Post()
  async markNotification(@Req() req, @Body() { notificationId }) {
    return await this.notificationService.markNotification(
      notificationId,
      req.user.sub,
    );
  }
}
