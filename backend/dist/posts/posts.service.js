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
const post_schema_1 = require("../schemes/post.schema");
const user_service_1 = require("../user/user.service");
const bson_1 = require("bson");
const image_service_1 = require("../image/image.service");
let PostsService = class PostsService {
    constructor(postsModel, usersService, imageService) {
        this.postsModel = postsModel;
        this.usersService = usersService;
        this.imageService = imageService;
    }
    async getPostByIdAndUser(postId, user_id) {
        return await this.postsModel.findOne({ _id: postId, user: user_id });
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
    async getPostById(postId) {
        const post = await this.postsModel.aggregate([
            { $match: { _id: postId } },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'comments',
                    foreignField: '_id',
                    as: 'comments',
                },
            },
        ]);
        if (!post || post.length === 0)
            throw new common_1.InternalServerErrorException('Could not find the post');
        return post[0];
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UsersService,
        image_service_1.ImageService])
], PostsService);
//# sourceMappingURL=posts.service.js.map