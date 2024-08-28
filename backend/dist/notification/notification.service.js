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
let NotificationService = class NotificationService {
    constructor(notificationModel) {
        this.notificationModel = notificationModel;
    }
    async createNotification(dto) {
        if (dto.createdBy === dto.createdFor)
            return;
        const filter = {
            createdBy: new mongoose_2.default.Types.ObjectId(dto.createdBy),
            createdFor: new mongoose_2.default.Types.ObjectId(dto.createdFor),
            relatedPost: new mongoose_2.default.Types.ObjectId(dto.relatedPost),
            relatedComment: dto.relatedComment
                ? new mongoose_2.default.Types.ObjectId(dto.relatedComment)
                : null,
        };
        const update = {
            $setOnInsert: {
                type: dto.type,
                createdBy: new mongoose_2.default.Types.ObjectId(dto.createdBy),
                createdFor: new mongoose_2.default.Types.ObjectId(dto.createdFor),
                createdAt: new Date(),
                relatedPost: new mongoose_2.default.Types.ObjectId(dto.relatedPost),
                relatedComment: dto.relatedComment
                    ? new mongoose_2.default.Types.ObjectId(dto.relatedComment)
                    : null,
                isSeen: false,
            },
        };
        const options = {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        };
        const result = await this.notificationModel.findOneAndUpdate(filter, update, options);
        if (!result) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'notification created succesfully.' };
    }
    async getNotifications(userId) {
        const notifications = await this.notificationModel
            .find({
            createdFor: new mongoose_2.default.Types.ObjectId(userId),
            isSeen: false,
        })
            .sort({ createdAt: -1 })
            .populate({ path: 'createdBy', select: 'username firstname lastname profilePictureId' });
        const postNotifications = new Map();
        const commentLikeNotifications = new Map();
        const commentNotifications = new Map();
        const commentAnswerNotifications = new Map();
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
            }
            else if (relatedPost && type === 'like' && i.relatedComment) {
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
            }
            else if (relatedPost && type === 'comment' && i.relatedComment) {
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
            }
            else if (type === 'answer') {
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
            }
            else if (i.type === 'follow') {
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
    async markNotification(notificationId, userId) {
        const updatedNotification = this.notificationModel.updateOne({
            createdFor: new mongoose_2.default.Types.ObjectId(userId),
            _id: new mongoose_2.default.Types.ObjectId(notificationId),
        }, { isSeem: true });
        if (!updatedNotification) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Notification marked succesfully' };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_scheme_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NotificationService);
//# sourceMappingURL=notification.service.js.map