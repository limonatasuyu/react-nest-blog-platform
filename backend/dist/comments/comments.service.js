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
const post_schema_1 = require("../schemes/post.schema");
const comment_schema_1 = require("../schemes/comment.schema");
const bson_1 = require("bson");
let CommentsService = class CommentsService {
    constructor(commentsModel, postsModel) {
        this.commentsModel = commentsModel;
        this.postsModel = postsModel;
    }
    async addComment(dto, userId) {
        const commentId = new bson_1.ObjectId();
        const createdComment = await this.commentsModel.create({
            _id: commentId,
            content: dto.content,
            user: userId,
            answerTo: dto.answeredCommentId,
        });
        if (!createdComment) {
            throw new common_1.InternalServerErrorException();
        }
        const updatePostResult = await this.postsModel.updateOne({ _id: dto.postId }, {
            $push: { commentIds: commentId },
        });
        if (!updatePostResult) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'comment created successfully' };
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
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __param(1, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CommentsService);
//# sourceMappingURL=comments.service.js.map