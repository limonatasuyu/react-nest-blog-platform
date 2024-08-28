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
    if (dto.createdBy === dto.createdFor) return;

    const filter = {
      createdBy: new mongoose.Types.ObjectId(dto.createdBy),
      createdFor: new mongoose.Types.ObjectId(dto.createdFor),
      relatedPost: new mongoose.Types.ObjectId(dto.relatedPost),
      relatedComment: dto.relatedComment
        ? new mongoose.Types.ObjectId(dto.relatedComment)
        : null,
    };

    const update = {
      $setOnInsert: {
        type: dto.type,
        createdBy: new mongoose.Types.ObjectId(dto.createdBy),
        createdFor: new mongoose.Types.ObjectId(dto.createdFor),
        createdAt: new Date(),
        relatedPost: new mongoose.Types.ObjectId(dto.relatedPost),
        relatedComment: dto.relatedComment
          ? new mongoose.Types.ObjectId(dto.relatedComment)
          : null,
        isSeen: false,
        isLookedAt: false,
      },
    };

    const options = {
      upsert: true, // Create the document if it does not exist
      new: true, // Return the updated document
      setDefaultsOnInsert: true, // Apply default values if a new document is created
    };

    const result = await this.notificationModel.findOneAndUpdate(
      filter,
      update,
      options,
    );

    if (!result) {
      throw new InternalServerErrorException();
    }

    return { message: 'notification created succesfully.' };
  }

  async getNotifications(userId: string) {
    const notifications = await this.notificationModel
      .find({
        createdFor: new mongoose.Types.ObjectId(userId),
        isLookedAt: false,
      })
      .sort({ createdAt: -1 })
      .populate({
        path: 'createdBy',
        select: 'username firstname lastname profilePictureId',
      });

    /*
     * -relatedPostları aynı olup relatedCommentleri olmayanlar ( bunların type'ı 'like' olmak zorunda olduğu için tekrar type'a bakmaya gerek yok ),
     * -relatedPostları ve relatedCommentleri aynı olan ve typeları 'like' olanlar,
     * -relatedPostları ve relatedCommentleri aynı olan ve typeları 'comment' olanlar,
     * -relatedPostları ve relatedCommentleri aynı olan ve typeları 'answer' olanlar,
     * -relatedUserları olanlar
     */

    const postNotifications: Map<
      string,
      {
        count: number;
        lastPerson: { firstname: string; lastname: string };
        type: 'like';
        postId: string;
      }
    > = new Map();

    const commentLikeNotifications: Map<
      string,
      {
        count: number;
        lastPerson: { firstname: string; lastname: string };
        type: 'like';
        postId: string;
        commentId: string;
      }
    > = new Map();

    const commentNotifications: Map<
      string,
      {
        count: number;
        lastPerson: { firstname: string; lastname: string };
        type: 'comment';
        postId: string;
        commentId: string;
      }
    > = new Map();

    const commentAnswerNotifications: Map<
      string,
      {
        count: number;
        lastPerson: { firstname: string; lastname: string };
        type: 'answer';
        postId: string;
        commentId: string;
      }
    > = new Map();

    const followNotifications = [];

    notifications.forEach((i) => {
      const lastPerson = {
        firstname: i.createdBy.firstname,
        lastname: i.createdBy.lastname,
      };
      const relatedPost = String(i.relatedPost);
      const type = i.type;

      if (relatedPost && type === 'like' && !i.relatedComment) {
        let count = 1;
        if (postNotifications.has(relatedPost)) {
          count = postNotifications.get(relatedPost).count + 1;
        }
        postNotifications.set(relatedPost, {
          count,
          lastPerson,
          type,
          postId: relatedPost,
        });
      } else if (relatedPost && type === 'like' && i.relatedComment) {
        const relatedComment = String(i.relatedComment);
        let count = 1;
        if (commentLikeNotifications.has(relatedComment)) {
          count = commentLikeNotifications.get(relatedComment).count + 1;
        }
        commentLikeNotifications.set(relatedComment, {
          count,
          lastPerson,
          postId: relatedPost,
          commentId: relatedComment,
          type,
        });
      } else if (relatedPost && type === 'comment' && i.relatedComment) {
        const relatedComment = String(i.relatedComment);
        let count = 1;
        if (commentNotifications.has(relatedComment)) {
          count = commentLikeNotifications.get(relatedComment).count + 1;
        }
        commentNotifications.set(relatedComment, {
          count,
          lastPerson,
          postId: relatedPost,
          commentId: relatedComment,
          type,
        });
      } else if (type === 'answer') {
        const relatedComment = String(i.relatedComment);
        let count = 1;
        if (commentAnswerNotifications.has(relatedComment)) {
          count = commentAnswerNotifications.get(relatedComment).count + 1;
        }
        commentAnswerNotifications.set(relatedComment, {
          count,
          lastPerson,
          postId: relatedPost,
          type,
          commentId: relatedComment,
        });
      } else if (i.type === 'follow') {
        followNotifications.push({
          ...lastPerson,
          username: i.createdBy.username,
        });
      }
    });

    const formattedNotifications = [
      ...postNotifications.values(),
      ...commentLikeNotifications.values(),
      ...commentNotifications.values(),
      ...commentAnswerNotifications.values(),
      ...followNotifications,
    ];
    return formattedNotifications;
  }


  async lookToNotification(notificationId: string, userId: string) {
    const updatedNotification = this.notificationModel.updateOne(
      {
        createdFor: new mongoose.Types.ObjectId(userId),
        _id: new mongoose.Types.ObjectId(notificationId),
      },
      { isLookedAt: true },
    );
    if (!updatedNotification) {
      throw new InternalServerErrorException();
    }

    return { message: 'Notification marked succesfully' };
  }

  async seeNotification(notificationId: string, userId: string) {
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
