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
exports.UserModuleController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_guard_1 = require("./user.guard");
let UserModuleController = class UserModuleController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getRecommendedUsers() {
        return this.usersService.getRecommendedUsers();
    }
    async getUser(username) {
        const user = await this.usersService.findOne(username);
        return {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            description: user.description,
            email: user.email,
            profilePictureId: user.profilePictureId,
        };
    }
    async create(dto) {
        return await this.usersService.create(dto);
    }
    async activate(dto) {
        return await this.usersService.activate(dto);
    }
    async recreateActivation(dto) {
        return await this.usersService.createActivationCode(dto);
    }
    async changePicture(req, { imageId }) {
        return await this.usersService.changeProfilePicture(imageId, req.user.sub);
    }
    async change_description(req, { description }) {
        return await this.usersService.changeDescription(description, req.user.sub);
    }
};
exports.UserModuleController = UserModuleController;
__decorate([
    (0, common_1.Get)('recommended'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserModuleController.prototype, "getRecommendedUsers", null);
__decorate([
    (0, common_1.Get)('profile/:username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserModuleController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('sign'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserModuleController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('activate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserModuleController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)('recreate-activation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserModuleController.prototype, "recreateActivation", null);
__decorate([
    (0, common_1.UseGuards)(user_guard_1.UserGuard),
    (0, common_1.Put)('change_picture'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserModuleController.prototype, "changePicture", null);
__decorate([
    (0, common_1.UseGuards)(user_guard_1.UserGuard),
    (0, common_1.Put)('change_description'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserModuleController.prototype, "change_description", null);
exports.UserModuleController = UserModuleController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UsersService])
], UserModuleController);
//# sourceMappingURL=user.controller.js.map