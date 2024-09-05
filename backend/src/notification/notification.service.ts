import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from '../schemes/notification.scheme';
import mongoose, { Model } from 'mongoose';
import { CreateNotificationDTO } from 'src/dto/notification-dto';

function getPassedTime(time: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeek = secondsInDay * 7;
  const secondsInMonth = secondsInDay * 30; // Approximation
  const secondsInYear = secondsInDay * 365; // Approximation

  if (diffInSeconds < secondsInMinute) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < secondsInHour) {
    const minutes = Math.floor(diffInSeconds / secondsInMinute);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < secondsInDay) {
    const hours = Math.floor(diffInSeconds / secondsInHour);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < secondsInWeek) {
    const days = Math.floor(diffInSeconds / secondsInDay);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < secondsInMonth) {
    const weeks = Math.floor(diffInSeconds / secondsInWeek);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < secondsInYear) {
    const months = Math.floor(diffInSeconds / secondsInMonth);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / secondsInYear);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createNotification(dto: CreateNotificationDTO, session?: any) {
    //console.log('dto: ', dto);
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
        updatedAt: new Date(),
        relatedPost: new mongoose.Types.ObjectId(dto.relatedPost),
        relatedComment: dto.relatedComment
          ? new mongoose.Types.ObjectId(dto.relatedComment)
          : null,
        answeredComment: dto.relatedComment
          ? new mongoose.Types.ObjectId(dto.answeredComment)
          : null,
        isSeen: false,
        isLookedAt: false,
      },
    };

    const options = {
      upsert: true, // Create the document if it does not exist
      new: true, // Return the updated document
      setDefaultsOnInsert: true, // Apply default values if a new document is created
      session,
    };

    const result = await this.notificationModel.findOneAndUpdate(
      filter,
      update,
      options,
    );

    //console.log('result: ', result);
    if (!result) {
      throw new InternalServerErrorException();
    }

    return { message: 'notification created succesfully.' };
  }

  async getNotifications(userId: string) {
    return [];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const notifications = await this.notificationModel
      .find({
        $or: [
          {
            createdFor: new mongoose.Types.ObjectId(userId),
            isSeen: false,
          },
          {
            createdFor: new mongoose.Types.ObjectId(userId),
            isSeen: true,
            updatedAt: { $gt: yesterday },
          },
        ],
      })
      .sort({ createdAt: -1 })
      .populate({
        path: 'createdBy',
        select: '_id username firstname lastname profilePictureId',
      })
      .populate({
        path: 'relatedComment',
        select: '_id content',
      })
      .populate({
        path: 'answeredComment',
        select: '_id content',
      })
      .populate({
        path: 'relatedPost',
        select: '_id title thumbnailId',
      });

    type Notification<T> = Map<
      string,
      {
        count: number;
        lastPerson: {
          firstname: string;
          lastname: string;
          profilePictureId?: string;
        };
        targetHref: string;
        isLookedAt: boolean;
        isSeen: boolean;
        notificationIds: string[];
        passedTime: string;
      } & T
    >;

    const postNotifications: Notification<{
      type: 'like';
      postTitle: string;
      thumbnailId?: string;
    }> = new Map();

    const commentLikeNotifications: Notification<{
      type: 'like';
    }> = new Map();

    const commentNotifications: Notification<{
      type: 'comment';
      commentContent: string;
      thumbnailId?: string;
    }> = new Map();

    const commentAnswerNotifications: Notification<{
      type: 'answer';
      commentContent: string;
      answerContent: string;
      postTitle: string;
      thumbnailId?: string;
    }> = new Map();

    const followNotifications: {
      id: string;
      lastPerson: {
        firstname: string;
        lastname: string;
        profilePictureId?: string;
      };
      profilePictureId?: string;
      notificationId: string;
      isLookedAt: boolean;
      isSeen: boolean;
      targetHref: string;
      passedTime: string;
      type: 'follow';
    }[] = [];

    notifications.forEach((i) => {
      const lastPerson = {
        firstname: i.createdBy.firstname,
        lastname: i.createdBy.lastname,
        profilePictureId: i.createdBy.profilePictureId,
      };
      const type = i.type;
      const isLookedAt = i.isLookedAt;
      const isSeen = i.isSeen;
      const notificationId = String(i._id);
      const passedTime = getPassedTime(i.createdAt);

      if (type === 'follow') {
        followNotifications.push({
          id: String(i._id),
          lastPerson,
          isLookedAt,
          notificationId,
          isSeen,
          targetHref: `/user?username=${String(i.createdBy.username)}`,
          passedTime,
          type,
        });
        return;
      }

      let notificationIds = [notificationId];
      const relatedPost = String(i.relatedPost._id);
      let count = 1;
      if (relatedPost && type === 'like' && !i.relatedComment) {
        if (postNotifications.has(relatedPost)) {
          const notifications = postNotifications.get(relatedPost);
          count = notifications.count + 1;
          notificationIds = [...notifications.notificationIds, notificationId];
        }
        postNotifications.set(relatedPost, {
          count,
          lastPerson,
          targetHref: `/post?id=${relatedPost}`,
          isLookedAt,
          isSeen,
          notificationIds,
          type,
          postTitle: i.relatedPost.title,
          thumbnailId: i.relatedPost.thumbnailId,
          passedTime,
        });
      } else if (relatedPost && type === 'like' && i.relatedComment) {
        const relatedComment = String(i.relatedComment._id);
        if (commentLikeNotifications.has(relatedComment)) {
          const notifications = commentLikeNotifications.get(relatedComment);
          count = notifications.count + 1;
          notificationIds = [...notifications.notificationIds, notificationId];
        }
        commentLikeNotifications.set(relatedComment, {
          count,
          lastPerson,
          targetHref: `/post?id=${relatedPost}&comment=${relatedComment}`,
          isLookedAt,
          isSeen,
          notificationIds,
          type,
          passedTime,
        });
      } else if (relatedPost && type === 'comment' && i.relatedComment) {
        const relatedComment = String(i.relatedComment._id);
        if (commentNotifications.has(relatedComment)) {
          const notifications = commentNotifications.get(relatedComment);
          count = notifications.count + 1;
          notificationIds = [...notifications.notificationIds, notificationId];
        }
        commentNotifications.set(relatedComment, {
          count,
          lastPerson,
          targetHref: `/post?id=${relatedPost}&comment=${relatedComment}`,
          isLookedAt,
          isSeen,
          notificationIds,
          type,
          commentContent: i.relatedComment.content,
          thumbnailId: i.relatedPost.thumbnailId,
          passedTime,
        });
      } else if (type === 'answer') {
        const relatedComment = String(i.relatedComment._id);
        if (commentAnswerNotifications.has(relatedComment)) {
          const notifications = commentAnswerNotifications.get(relatedComment);
          count = notifications.count + 1;
          notificationIds = [...notifications.notificationIds, notificationId];
        }
        commentAnswerNotifications.set(relatedComment, {
          count,
          lastPerson,
          targetHref: `/post?id=${relatedPost}&comment=${relatedComment}&answer=${i.answeredComment._id}`,
          isLookedAt,
          isSeen,
          notificationIds,
          type,
          commentContent: i.answeredComment.content,
          answerContent: i.relatedComment.content,
          postTitle: i.relatedPost.title,
          thumbnailId: i.relatedPost.thumbnailId,
          passedTime,
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

  async lookToNotifications(notificationIds: string[], userId: string) {
    const ops = notificationIds.map((i) => ({
      updateOne: {
        filter: {
          createdFor: new mongoose.Types.ObjectId(userId),
          _id: new mongoose.Types.ObjectId(i),
        },
        update: { isLookedAt: true },
      },
    }));

    const updatedNotifications = await this.notificationModel.bulkWrite(ops);
    if (!updatedNotifications) {
      throw new InternalServerErrorException();
    }

    return { message: 'Notifications marked succesfully' };
  }

  async seeNotifications(notificationIds: string[], userId: string) {
    const ops = notificationIds.map((i) => ({
      updateOne: {
        filter: {
          createdFor: new mongoose.Types.ObjectId(userId),
          _id: new mongoose.Types.ObjectId(i),
        },
        update: { isSeen: true },
      },
    }));

    const updatedNotifications = await this.notificationModel.bulkWrite(ops);

    if (!updatedNotifications) {
      throw new InternalServerErrorException();
    }

    return { message: 'Notifications marked succesfully' };
  }
}
