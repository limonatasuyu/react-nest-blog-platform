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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose = require("mongoose");
const post_schema_1 = require("../schemes/post.schema");
const comment_schema_1 = require("../schemes/comment.schema");
const notification_service_1 = require("../notification/notification.service");
const user_service_1 = require("../user/user.service");
let CommentsService = class CommentsService {
    constructor(commentsModel, postsModel, notificationService, usersService) {
        this.commentsModel = commentsModel;
        this.postsModel = postsModel;
        this.notificationService = notificationService;
        this.usersService = usersService;
    }
    async addComment(dto, userId) {
        const commentId = new mongoose.Types.ObjectId();
        const createdComment = await this.commentsModel.create({
            _id: commentId,
            content: dto.content,
            user: userId,
            answerTo: dto.answeredCommentId,
            createdAt: new Date(),
            post: dto.postId,
        });
        if (!createdComment) {
            throw new common_1.InternalServerErrorException();
        }
        if (dto.ownerCommentId) {
            await this.commentsModel.updateOne({ _id: dto.ownerCommentId }, { $push: { answers: commentId } });
        }
        const updatedPost = await this.postsModel.findOne({
            _id: new mongoose.Types.ObjectId(dto.postId),
        });
        if (updatedPost) {
            updatedPost.comments.push(createdComment);
            await updatedPost.save();
        }
        await this.notificationService.createNotification({
            type: 'comment',
            createdBy: userId,
            createdFor: updatedPost.user,
            relatedPost: dto.postId,
            relatedComment: createdComment._id,
        });
        const answeredComment = await this.commentsModel.findOne({
            _id: dto.answeredCommentId,
        });
        if (dto.answeredCommentId && updatedPost.user !== answeredComment.user) {
            await this.notificationService.createNotification({
                type: 'answer',
                createdBy: userId,
                createdFor: answeredComment.user,
                relatedPost: dto.postId,
                relatedComment: createdComment._id,
                answeredComment: dto.answeredCommentId,
            });
        }
        return { commentId };
    }
    async deleteComment(dto) {
        const updatePostResult = await this.postsModel.updateOne({ _id: dto.postId }, { $pull: { commentIds: dto.commentId } });
        if (!updatePostResult) {
            throw new common_1.InternalServerErrorException();
        }
        const deleteResult = await this.commentsModel.deleteOne({
            _id: dto.commentId,
        });
        if (!deleteResult) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'comment deleted successfully' };
    }
    async findCommentByCommentIdAndUserId(commentId, userId) {
        return await this.commentsModel.findOne({ _id: commentId, user: userId });
    }
    async likeComment(commentId, user_id) {
        const user = await this.usersService.getById(user_id);
        if (!user)
            throw new common_1.InternalServerErrorException();
        const updatedComment = await this.commentsModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(commentId) }, [
            {
                $set: {
                    likedBy: {
                        $cond: [
                            { $in: [new mongoose.Types.ObjectId(user_id), '$likedBy'] },
                            {
                                $setDifference: [
                                    '$likedBy',
                                    [new mongoose.Types.ObjectId(user_id)],
                                ],
                            },
                            {
                                $concatArrays: [
                                    '$likedBy',
                                    [new mongoose.Types.ObjectId(user_id)],
                                ],
                            },
                        ],
                    },
                },
            },
        ], {
            projection: {
                user: 1,
                post: 1,
                answerTo: 1,
            },
        });
        if (!updatedComment) {
            throw new common_1.InternalServerErrorException();
        }
        await this.notificationService.createNotification({
            type: 'comment',
            createdBy: user_id,
            createdFor: updatedComment.user,
            relatedPost: updatedComment.post,
            relatedComment: updatedComment.answerTo,
        });
        return { message: 'Operation handled successfully' };
    }
    async getAnswers(page, commentId) {
        const answerPageSize = 2;
        const answers = await this.commentsModel
            .find({
            answerTo: commentId,
        })
            .sort({ createdAt: -1 })
            .skip(page * answerPageSize)
            .limit(answerPageSize)
            .populate('content answerTo createdAt')
            .populate({
            path: 'user',
            select: 'firstname lastname username profilePictureId',
        });
        return answers;
    }
    async getByPostId(page, postId) {
        const pageSize = 10;
        const answerPageSize = 2;
        const comments = await this.commentsModel.aggregate([
            {
                $match: {
                    post: new mongoose.Types.ObjectId(postId),
                    answerTo: undefined,
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'answerTo',
                    as: 'answers',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'answers.user',
                    foreignField: '_id',
                    as: 'answerUsers',
                },
            },
            {
                $addFields: {
                    answers: {
                        $map: {
                            input: { $ifNull: ['$answers', []] },
                            as: 'answer',
                            in: {
                                _id: '$$answer._id',
                                content: '$$answer.content',
                                answerTo: '$$answer.answerTo',
                                createdAt: '$$answer.createdAt',
                                user: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$answerUsers',
                                                as: 'user',
                                                cond: { $eq: ['$$user._id', '$$answer.user'] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                                likedCount: { $size: { $ifNull: ['$$answer.likedBy', []] } },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    user: {
                        firstname: 1,
                        lastname: 1,
                        username: 1,
                        profilePictureId: 1,
                    },
                    likedCount: { $size: { $ifNull: ['$likedBy', []] } },
                    answerPageCount: {
                        $ceil: { $divide: [{ $size: '$answers' }, answerPageSize] },
                    },
                    answers: { $slice: ['$answers', answerPageSize] },
                },
            },
            {
                $facet: {
                    comments: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (page - 1) * pageSize },
                        { $limit: pageSize },
                    ],
                    totalRecordCount: [{ $count: 'count' }],
                },
            },
            {
                $addFields: {
                    totalPageCount: {
                        $ifNull: [
                            {
                                $ceil: {
                                    $divide: [
                                        { $arrayElemAt: ['$totalRecordCount.count', 0] },
                                        pageSize,
                                    ],
                                },
                            },
                            1,
                        ],
                    },
                },
            },
        ]);
        return comments[0] ?? { comments: [], totalPageCount: 1 };
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __param(1, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notification_service_1.NotificationService,
        user_service_1.UsersService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map