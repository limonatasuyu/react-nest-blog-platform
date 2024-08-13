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
let PostsService = class PostsService {
    constructor(postsModel, usersService) {
        this.postsModel = postsModel;
        this.usersService = usersService;
    }
    async getPostsByTag(dto) {
        const posts = await this.postsModel
            .find({ tags: { $in: dto.tags } })
            .limit(10)
            .skip((dto.page - 1) * 10)
            .exec();
        return posts;
    }
    async getRecentPosts(dto) {
        const posts = await this.postsModel
            .find()
            .limit(10)
            .skip((dto.page - 1) * 10)
            .sort({ createdAt: -1 })
            .exec();
        return posts;
    }
    async createPost(dto, username) {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There has been an error, please try again later1.',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const createdPost = await this.postsModel.create({
            title: dto.title,
            content: dto.content,
            imageIds: dto.imageDataUrls,
            user: user,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        if (!createdPost) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There has been an error, please try again later2.',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return await createdPost.save();
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UsersService])
], PostsService);
//# sourceMappingURL=posts.service.js.map