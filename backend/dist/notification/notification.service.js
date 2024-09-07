"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const notification_scheme_1 = require("../schemes/notification.scheme");
const mongoose_2 = require("mongoose");
function getPassedTime(time) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    const secondsInMinute = 60;
    const secondsInHour = secondsInMinute * 60;
    const secondsInDay = secondsInHour * 24;
    const secondsInWeek = secondsInDay * 7;
    const secondsInMonth = secondsInDay * 30;
    const secondsInYear = secondsInDay * 365;
    if (diffInSeconds < secondsInMinute) {
        return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    else if (diffInSeconds < secondsInHour) {
        const minutes = Math.floor(diffInSeconds / secondsInMinute);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    else if (diffInSeconds < secondsInDay) {
        const hours = Math.floor(diffInSeconds / secondsInHour);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    else if (diffInSeconds < secondsInWeek) {
        const days = Math.floor(diffInSeconds / secondsInDay);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    else if (diffInSeconds < secondsInMonth) {
        const weeks = Math.floor(diffInSeconds / secondsInWeek);
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }
    else if (diffInSeconds < secondsInYear) {
        const months = Math.floor(diffInSeconds / secondsInMonth);
        return `${months} month${months !== 1 ? 's' : ''} ago`;
    }
    else {
        const years = Math.floor(diffInSeconds / secondsInYear);
        return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
}
let NotificationService = class NotificationService {
    constructor(notificationModel) {
        this.notificationModel = notificationModel;
    }
    async createNotification(dto, session) {
        if (dto.createdBy === dto.createdFor)
            return;
        const filter = {
            createdBy: new mongoose_2.default.Types.ObjectId(dto.createdBy),
            createdFor: new mongoose_2.default.Types.ObjectId(dto.createdFor),
            relatedPost: new mongoose_2.default.Types.ObjectId(dto.relatedPost),
            relatedComment: dto.relatedComment
                ? new mongoose_2.default.Types.ObjectId(dto.relatedComment)
                : null,
            isSeen: false,
        };
        const update = {
            $setOnInsert: {
                type: dto.type,
                createdBy: new mongoose_2.default.Types.ObjectId(dto.createdBy),
                createdFor: new mongoose_2.default.Types.ObjectId(dto.createdFor),
                createdAt: new Date(),
                updatedAt: new Date(),
                relatedPost: new mongoose_2.default.Types.ObjectId(dto.relatedPost),
                relatedComment: dto.relatedComment
                    ? new mongoose_2.default.Types.ObjectId(dto.relatedComment)
                    : null,
                answeredComment: dto.relatedComment
                    ? new mongoose_2.default.Types.ObjectId(dto.answeredComment)
                    : null,
                isSeen: false,
                isLookedAt: false,
            },
        };
        const options = {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
            session,
        };
        const result = await this.notificationModel.findOneAndUpdate(filter, update, options);
        if (!result) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'notification created succesfully.' };
    }
    async getNotifications(userId) {
        return [];
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const notifications = await this.notificationModel
            .find({
            $or: [
                {
                    createdFor: new mongoose_2.default.Types.ObjectId(userId),
                    isSeen: false,
                },
                {
                    createdFor: new mongoose_2.default.Types.ObjectId(userId),
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
        const postNotifications = new Map();
        const commentLikeNotifications = new Map();
        const commentNotifications = new Map();
        const commentAnswerNotifications = new Map();
        const followNotifications = [];
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
            }
            else if (relatedPost && type === 'like' && i.relatedComment) {
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
            }
            else if (relatedPost && type === 'comment' && i.relatedComment) {
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
            }
            else if (type === 'answer') {
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
    async lookToNotifications(notificationIds, userId) {
        const ops = notificationIds.map((i) => ({
            updateOne: {
                filter: {
                    createdFor: new mongoose_2.default.Types.ObjectId(userId),
                    _id: new mongoose_2.default.Types.ObjectId(i),
                },
                update: { isLookedAt: true },
            },
        }));
        const updatedNotifications = await this.notificationModel.bulkWrite(ops);
        if (!updatedNotifications) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Notifications marked succesfully' };
    }
    async seeNotifications(notificationIds, userId) {
        const ops = notificationIds.map((i) => ({
            updateOne: {
                filter: {
                    createdFor: new mongoose_2.default.Types.ObjectId(userId),
                    _id: new mongoose_2.default.Types.ObjectId(i),
                },
                update: { isSeen: true },
            },
        }));
        const updatedNotifications = await this.notificationModel.bulkWrite(ops);
        if (!updatedNotifications) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Notifications marked succesfully' };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_scheme_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NotificationService);
//# sourceMappingURL=notification.service.js.map