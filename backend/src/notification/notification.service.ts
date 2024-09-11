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

function arraysEqual(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Sort both arrays
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  return true;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createNotification(dto: CreateNotificationDTO, session?: any) {
    if (dto.createdBy === dto.createdFor) {
      return {
        message:
          'createdBy and createdFor values cannot be the same, no operations were performed.',
      };
    }
    if (
      dto.type === 'follow' &&
      //I don't want someone to give a very long object and consume the memory for no reason
      (Object.keys(dto).length !== 3 ||
        !arraysEqual(Object.keys(dto), ['createdBy', 'createdFor', 'type']))
    ) {
      throw new InternalServerErrorException(
        'notifications of type "follow" does not need, and must not have values other than createdFor, createdBy and type.',
      );
    } else if (
      dto.type === 'comment' &&
      (Object.keys(dto).length !== 5 ||
        !arraysEqual(Object.keys(dto), [
          'createdBy',
          'createdFor',
          'relatedPost',
          'relatedComment',
          'type',
        ]))
    ) {
      throw new InternalServerErrorException(
        'notifications of type "comment" does not need, and must not have values other than createdFor, createdBy, relatedPost, relatedComment and type.',
      );
    } else if (
      dto.type === 'answer' &&
      (Object.keys(dto).length !== 6 ||
        !arraysEqual(Object.keys(dto), [
          'type',
          'createdBy',
          'createdFor',
          'relatedPost',
          'relatedComment',
          'answeredComment',
        ]))
    ) {
      throw new InternalServerErrorException(
        'notifications of type "answer" does not need, and must not have values other than createdFor, createdBy, relatedPost, relatedComment, answeredComment and type.',
      );
    } else if (
      dto.type === 'like' &&
      ((Object.keys(dto).length !== 5 && Object.keys(dto).length !== 4) ||
        !(
          arraysEqual(Object.keys(dto), [
            'type',
            'createdBy',
            'createdFor',
            'relatedPost',
            'relatedComment',
          ]) ||
          arraysEqual(Object.keys(dto), [
            'type',
            'createdBy',
            'createdFor',
            'relatedPost',
          ])
        ))
    ) {
      throw new InternalServerErrorException(
        'notifications of type "like" only need, createdFor, createdBy, relatedPost, relatedComment and type. relatedComment is optional',
      );
    } else if (
      !dto.type ||
      !['follow', 'like', 'comment', 'answer'].includes(dto.type)
    ) {
      throw new InternalServerErrorException(
        'notifications should have a type, which is either of "follow", "like", "comment", or "answer"',
      );
    }
    const filter = {
      createdBy: new mongoose.Types.ObjectId(dto.createdBy),
      createdFor: new mongoose.Types.ObjectId(dto.createdFor),
      relatedPost: new mongoose.Types.ObjectId(dto.relatedPost),
      relatedComment: dto.relatedComment
        ? new mongoose.Types.ObjectId(dto.relatedComment)
        : null,
      isSeen: false,
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

    if (!result) {
      throw new InternalServerErrorException();
    }

    return { message: 'notification created succesfully.' };
  }

  async getNotifications(userId: string) {
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
        commentLikeNotifications.set(`${relatedComment}_${relatedPost}`, {
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
        if (commentNotifications.has(relatedPost)) {
          const notifications = commentNotifications.get(relatedPost);
          count = notifications.count + 1;
          notificationIds = [...notifications.notificationIds, notificationId];
        }
        commentNotifications.set(relatedPost, {
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
    if (!notificationIds.length) {
      return { message: 'No data provided. No operations were performed.' };
    }

    const session = await this.notificationModel.startSession();
    session.startTransaction();

    try {
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
      if (
        !updatedNotifications ||
        updatedNotifications.modifiedCount !== notificationIds.length
      ) {
        throw new InternalServerErrorException();
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    } finally {
      session.endSession();
    }
    return { message: 'Notifications marked succesfully' };
  }

  async seeNotifications(notificationIds: string[], userId: string) {
    if (!notificationIds.length) {
      return { message: 'No data provided. No operations were performed.' };
    }

    const session = await this.notificationModel.startSession();
    session.startTransaction();

    try {
      const ops = notificationIds.map((i) => ({
        updateOne: {
          filter: {
            createdFor: new mongoose.Types.ObjectId(userId),
            _id: new mongoose.Types.ObjectId(i),
          },
          update: { isSeen: true },
        },
      }));

      const updatedNotifications = await this.notificationModel.bulkWrite(ops, {
        session,
      });

      if (
        !updatedNotifications ||
        updatedNotifications.modifiedCount !== notificationIds.length
      ) {
        //await session.abortTransaction();
        //session.endSession();
        throw new InternalServerErrorException();
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    } finally {
      session.endSession();
    }

    return { message: 'Notifications marked succesfully' };
  }
}
