import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from '../schemes/notification.scheme';
import mongoose, { Model } from 'mongoose';
import { CreateNotificationDTO } from 'src/dto/notification-dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createNotification(dto: CreateNotificationDTO) {
    const createdNotification = await this.notificationModel.create({
      _id: new mongoose.Types.ObjectId(),
      type: dto.type,
      createdBy: new mongoose.Types.ObjectId(dto.createdBy),
      createdFor: new mongoose.Types.ObjectId(dto.createdFor),
      createdAt: new Date(),
      relatedPost: new mongoose.Types.ObjectId(dto.relatedPost),
      relatedComment:
        dto.relatedComment && new mongoose.Types.ObjectId(dto.relatedComment),
      isSeen: false,
    });
    if (!createdNotification) {
      throw new InternalServerErrorException();
    }

    return { message: 'notification created succesfully.' };
  }

  async getNotifications(userId: string) {
    return await this.notificationModel.find({
      createdFor: new mongoose.Types.ObjectId(userId),
      isSeen: false,
    });
  }

  async markNotification(notificationId: string, userId: string) {
    const updatedNotification = this.notificationModel.updateOne(
      {
        createdFor: new mongoose.Types.ObjectId(userId),
        _id: new mongoose.Types.ObjectId(notificationId),
      },
      { isSeem: true },
    );
    if (!updatedNotification) {
      throw new InternalServerErrorException();
    }

    return { message: 'Notification marked succesfully' };
  }
}
