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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose = require("mongoose");
const post_schema_1 = require("../schemes/post.schema");
const user_service_1 = require("../user/user.service");
const image_service_1 = require("../image/image.service");
const user_schema_1 = require("../schemes/user.schema");
const tag_service_1 = require("../tag/tag.service");
const notification_service_1 = require("../notification/notification.service");
let PostsService = class PostsService {
    constructor(postsModel, usersModel, usersService, imageService, tagService, notificationService) {
        this.postsModel = postsModel;
        this.usersModel = usersModel;
        this.usersService = usersService;
        this.imageService = imageService;
        this.tagService = tagService;
        this.notificationService = notificationService;
    }
    async getPostByIdAndUser(postId, user_id) {
        return await this.postsModel.findOne({ _id: postId, user: user_id });
    }
    async savePost(postId, user_id) {
        const updatedUser = await this.usersModel.updateOne({ _id: new mongoose.Types.ObjectId(user_id) }, [
            {
                $set: {
                    savedPosts: {
                        $cond: {
                            if: {
                                $in: [new mongoose.Types.ObjectId(postId), '$savedPosts'],
                            },
                            then: {
                                $filter: {
                                    input: '$savedPosts',
                                    as: 'post',
                                    cond: {
                                        $ne: ['$$post', new mongoose.Types.ObjectId(postId)],
                                    },
                                },
                            },
                            else: {
                                $concatArrays: [
                                    '$savedPosts',
                                    [new mongoose.Types.ObjectId(postId)],
                                ],
                            },
                        },
                    },
                },
            },
        ]);
        if (!updatedUser || !updatedUser.modifiedCount) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Operation handled successfully.' };
    }
    async likePost(postId, user_id) {
        const updatedPost = await this.postsModel.findOneAndUpdate({ _id: postId }, [
            {
                $set: {
                    likedBy: {
                        $cond: {
                            if: { $in: [user_id, '$likedBy'] },
                            then: {
                                $filter: {
                                    input: '$likedBy',
                                    as: 'user',
                                    cond: { $ne: ['$$user', user_id] },
                                },
                            },
                            else: { $concatArrays: ['$likedBy', [user_id]] },
                        },
                    },
                },
            },
        ], {
            projection: {
                user: 1,
                isUserLiked: { $in: [user_id, '$likedBy'] },
            },
            new: true,
        });
        if (!updatedPost) {
            throw new common_1.InternalServerErrorException();
        }
        if (updatedPost.isUserLiked) {
            await this.notificationService.createNotification({
                type: 'like',
                createdBy: user_id,
                createdFor: updatedPost.user,
                relatedPost: postId,
            });
        }
        return { message: 'Operation handled successfully' };
    }
    async getPosts(dto) {
        const pageSize = 10;
        const ops = [
            {
                $lookup: {
                    from: 'tags',
                    localField: 'tags',
                    foreignField: '_id',
                    as: 'tagDetails',
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
                $facet: {
                    posts: [
                        {
                            $project: {
                                id: 1,
                                title: 1,
                                content: 1,
                                thumbnailId: 1,
                                likedCount: { $size: '$likedBy' },
                                commentCount: { $size: '$comments' },
                                tags: {
                                    $map: { input: '$tagDetails', as: 'tag', in: '$$tag.name' },
                                },
                                user: {
                                    username: 1,
                                    firstname: 1,
                                    lastname: 1,
                                    description: 1,
                                    profilePictureId: 1,
                                },
                            },
                        },
                        {
                            $sort: { createdAt: -1 },
                        },
                        {
                            $skip: (dto.page - 1) * pageSize,
                        },
                        {
                            $limit: pageSize,
                        },
                    ],
                    totalRecordCount: [{ $count: 'count' }],
                },
            },
            {
                $addFields: {
                    totalPageCount: {
                        $ceil: {
                            $divide: [
                                { $arrayElemAt: ['$totalRecordCount.count', 0] },
                                pageSize,
                            ],
                        },
                    },
                },
            },
        ];
        if (dto.tag && dto.tag.toLowerCase() !== 'all' && dto.username) {
            const tag = await this.tagService.findOne(dto.tag);
            const user = await this.usersService.findOne(dto.username);
            ops.unshift({ $match: { tags: { $in: [tag._id] }, user: user._id } });
        }
        else if (dto.tag && dto.tag.toLowerCase() !== 'all') {
            const tag = await this.tagService.findOne(dto.tag);
            ops.unshift({ $match: { tags: { $in: [tag._id] } } });
        }
        else if (dto.username) {
            const user = await this.usersService.findOne(dto.username);
            ops.unshift({ $match: { user: user._id } });
        }
        const posts = await this.postsModel.aggregate(ops).exec();
        if (!posts || !posts[0]) {
            throw new common_1.InternalServerErrorException();
        }
        return posts[0];
    }
    async createPost(dto, username) {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new common_1.InternalServerErrorException();
        }
        const createdTags = await this.tagService.createTagsForPost(dto.tags);
        const postId = new mongoose.Types.ObjectId();
        const createdPost = await this.postsModel.create({
            _id: postId,
            title: dto.title,
            content: dto.content,
            thumbnailId: dto.thumbnailId,
            user: user,
            tags: createdTags.map((i) => i._id),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        if (!createdPost) {
            throw new common_1.InternalServerErrorException();
        }
        await this.usersModel.updateOne({ _id: user._id }, { $push: { posts: postId } });
        if (dto.thumbnailId) {
            await this.imageService.relateImage(dto.thumbnailId);
        }
        return { message: 'Post created successfully' };
    }
    async deletePost(dto, username) {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new common_1.InternalServerErrorException();
        }
        const result = await this.postsModel.deleteOne({ _id: dto.postId });
        if (!result) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Post deleted successfully' };
    }
    async updatePost(dto, username) {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new common_1.InternalServerErrorException();
        }
        const updatedPost = await this.postsModel.updateOne({ _id: dto.postId }, {
            title: dto.title,
            content: dto.content,
            thumbnailId: dto.thumbnailId,
            updatedAt: new Date(),
            tags: dto.tags,
        });
        if (!updatedPost) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Post updated successfully' };
    }
    async getPostById(postId, user_id) {
        const post = await this.postsModel.aggregate([
            { $match: { _id: postId } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'tags',
                    localField: 'tags',
                    foreignField: '_id',
                    as: 'tags',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    thumbnailId: 1,
                    title: 1,
                    content: 1,
                    tags: { name: 1 },
                    createdAt: 1,
                    commentCount: { $size: '$comments' },
                    likedCount: { $size: '$likedBy' },
                    isUserLiked: { $in: [user_id, '$likedBy'] },
                    user: {
                        firstname: 1,
                        lastname: 1,
                        username: 1,
                        profilePictureId: 1,
                    },
                },
            },
        ]);
        if (!post || post.length === 0)
            throw new common_1.InternalServerErrorException('Could not find the post');
        const user = await this.usersModel.findOne({
            _id: new mongoose.Types.ObjectId(user_id),
            savedPosts: { $in: [new mongoose.Types.ObjectId(postId)] },
        });
        post[0].isUserSaved = Boolean(user);
        return post[0];
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        user_service_1.UsersService,
        image_service_1.ImageService,
        tag_service_1.TagService,
        notification_service_1.NotificationService])
], PostsService);
//# sourceMappingURL=posts.service.js.map