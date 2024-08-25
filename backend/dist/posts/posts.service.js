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
const bson_1 = require("bson");
const image_service_1 = require("../image/image.service");
const user_schema_1 = require("../schemes/user.schema");
let PostsService = class PostsService {
    constructor(postsModel, usersModel, usersService, imageService) {
        this.postsModel = postsModel;
        this.usersModel = usersModel;
        this.usersService = usersService;
        this.imageService = imageService;
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
        const updatedPost = await this.postsModel.updateOne({ _id: postId }, [
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
        ]);
        if (!updatedPost) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Operation handled successfully' };
    }
    async getPostsByTag(dto) {
        const posts = await this.postsModel
            .find({ tags: { $in: dto.tags } })
            .limit(10)
            .skip((dto.page - 1) * 10)
            .populate({
            path: 'user',
            select: 'username firstname lastname',
        })
            .exec();
        if (!posts) {
            throw new common_1.InternalServerErrorException();
        }
        return posts.map((i) => ({
            title: i.title,
            content: i.content,
            commentCount: i.comments.length,
            likedCount: i.likedBy.length,
            thumbnailId: i.thumbnailId,
            tags: i.tags,
            user: {
                username: i.user.username,
                name: i.user.firstname + ' ' + i.user.lastname,
            },
        }));
    }
    async getRecentPosts(dto) {
        const posts = await this.postsModel
            .find()
            .limit(10)
            .skip((dto.page - 1) * 10)
            .sort({ createdAt: -1 })
            .populate({
            path: 'user',
            select: 'username firstname lastname',
        })
            .exec();
        if (!posts) {
            throw new common_1.InternalServerErrorException();
        }
        return posts.map((i) => ({
            id: i._id,
            title: i.title,
            content: i.content,
            commentCount: i.comments.length,
            likedCount: i.likedBy.length,
            thumbnailId: i.thumbnailId,
            tags: i.tags,
            user: {
                username: i.user.username,
                name: i.user.firstname + ' ' + i.user.lastname,
            },
        }));
    }
    async createPost(dto, username) {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new common_1.InternalServerErrorException();
        }
        const createdPost = await this.postsModel.create({
            _id: new bson_1.ObjectId(),
            title: dto.title,
            content: dto.content,
            thumbnailId: dto.thumbnailId,
            user: user,
            tags: dto.tags,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        if (!createdPost) {
            throw new common_1.InternalServerErrorException();
        }
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
    async getUsersPosts(username) {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new common_1.InternalServerErrorException();
        }
        const posts = await this.postsModel.find({ user: user._id });
        if (!posts) {
            throw new common_1.InternalServerErrorException();
        }
        return posts.map((i) => ({
            title: i.title,
            content: i.content,
            commentCount: i.comments.length,
            likedCount: i.likedBy.length,
            thumbnailId: i.thumbnailId,
            tags: i.tags,
        }));
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
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'comments',
                    let: { commentsIds: '$comments' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$commentsIds'] } } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user',
                            },
                        },
                        { $unwind: '$user' },
                    ],
                    as: 'comments',
                },
            },
            {
                $project: {
                    thumbnailId: 1,
                    title: 1,
                    content: 1,
                    tags: 1,
                    createdAt: 1,
                    likedBy: 1,
                    user: {
                        firstname: 1,
                        lastname: 1,
                        username: 1,
                        profilePictureId: 1,
                    },
                    comments: {
                        $filter: {
                            input: {
                                $map: {
                                    input: '$comments',
                                    as: 'comment',
                                    in: {
                                        _id: '$$comment._id',
                                        content: '$$comment.content',
                                        createdAt: '$$comment.createdAt',
                                        answerTo: '$$comment.answerTo',
                                        user: {
                                            firstname: '$$comment.user.firstname',
                                            lastname: '$$comment.user.lastname',
                                            username: '$$comment.user.username',
                                            profilePictureId: '$$comment.user.profilePictureId',
                                        },
                                        likedCount: { $size: '$$comment.likedBy' },
                                        isUserLiked: {
                                            $in: [
                                                new mongoose.Types.ObjectId(user_id),
                                                '$$comment.likedBy',
                                            ],
                                        },
                                    },
                                },
                            },
                            as: 'comment',
                            cond: { $ne: ['$$comment._id', null] },
                        },
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
        const commentCount = post[0].comments.length;
        const likedCount = post[0].likedBy.length;
        const isUserLiked = Boolean(post[0].likedBy.find((i) => i === user_id));
        post[0].likedBy = undefined;
        const answers = post[0].comments.filter((i) => Boolean(i.answerTo));
        const commentsWithoutAnswers = post[0].comments.filter((i) => !Boolean(i.answerTo));
        const formattedComments = commentsWithoutAnswers.map((i) => ({
            ...i,
            answers: answers.filter((i_) => String(i_.answerTo) === String(i._id)),
        }));
        post[0].comments = formattedComments;
        return { ...post[0], commentCount, likedCount, isUserLiked };
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
        image_service_1.ImageService])
], PostsService);
//# sourceMappingURL=posts.service.js.map