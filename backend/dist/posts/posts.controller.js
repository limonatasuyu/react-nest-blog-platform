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
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const posts_service_1 = require("./posts.service");
const posts_guard_1 = require("./posts.guard");
let PostsController = class PostsController {
    constructor(postsService) {
        this.postsService = postsService;
    }
    getPosts({ page }) {
        return this.postsService.getRecentPosts({ page });
    }
    getPostsByTags({ tags, page }) {
        return this.postsService.getPostsByTag({ tags, page });
    }
    getRecentPosts({ page }) {
        return this.postsService.getRecentPosts({ page });
    }
    likePost(req, postId) {
        return this.postsService.likePost(postId, req.user.sub);
    }
    savePost(req, postId) {
        return this.postsService.savePost(postId, req.user.sub);
    }
    createPost(req, dto) {
        return this.postsService.createPost(dto, req.user.username);
    }
    deletePost(req, postId) {
        return this.postsService.deletePost({ postId }, req.user.username);
    }
    updatePost(req, postId, body) {
        return this.postsService.updatePost({ ...body, postId }, req.user.username);
    }
    getMyPosts(req) {
        return this.postsService.getUsersPosts(req.user.username);
    }
    async getPost(req, postId) {
        return this.postsService.getPostById(postId, req.user.sub);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.UseGuards)(posts_guard_1.PostsGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "getPosts", null);
__decorate([
    (0, common_1.UseGuards)(posts_guard_1.PostsGuard),
    (0, common_1.Get)('tag'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "getPostsByTags", null);
__decorate([
    (0, common_1.UseGuards)(posts_guard_1.PostsGuard),
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "getRecentPosts", null);
__decorate([
    (0, common_1.UseGuards)(posts_guard_1.PostsGuard),
    (0, common_1.Get)(':id/like'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "likePost", null);
__decorate([
    (0, common_1.UseGuards)(posts_guard_1.PostsGuard),
    (0, common_1.Get)('save/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "savePost", null);
__decorate([
    (0, common_1.UseGuards)(posts_guard_1.PostsGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "createPost", null);
__decorate([
    (0, common_1.UseGuards)(posts_guard_1.PostsGuard),
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('post_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "deletePost", null);
__decorate([
    (0, common_1.UseGuards)(posts_guard_1.PostsGuard),
    (0, common_1.Put)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('post_id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "updatePost", null);
__decorate([
    (0, common_1.UseGuards)(posts_guard_1.PostsGuard),
    (0, common_1.Get)('my_posts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "getMyPosts", null);
__decorate([
    (0, common_1.UseGuards)(posts_guard_1.PostsGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPost", null);
exports.PostsController = PostsController = __decorate([
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map