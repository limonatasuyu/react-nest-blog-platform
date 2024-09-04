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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const tag_service_1 = require("./tag/tag.service");
const user_service_1 = require("./user/user.service");
const posts_service_1 = require("./posts/posts.service");
let AppService = class AppService {
    constructor(tagService, userService, postService) {
        this.tagService = tagService;
        this.userService = userService;
        this.postService = postService;
    }
    async getRecommended() {
        const tags = await this.tagService.getPopularTags();
        const users = await this.userService.getRecommendedUsers();
        if (!tags || !users) {
            throw new common_1.InternalServerErrorException();
        }
        return { tags, users };
    }
    async getSearchResults(page, keyword) {
        const postsData = await this.postService.getSearchResults(page, keyword);
        const usersData = await this.userService.getSearchResults(page, keyword);
        return { postsData, usersData };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tag_service_1.TagService,
        user_service_1.UsersService,
        posts_service_1.PostsService])
], AppService);
//# sourceMappingURL=app.service.js.map