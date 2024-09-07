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
exports.CommentsGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const comments_service_1 = require("./comments.service");
let CommentsGuard = class CommentsGuard {
    constructor(jwtService, commentsService) {
        this.jwtService = jwtService;
        this.commentsService = commentsService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            request['user'] = payload;
        }
        catch {
            throw new common_1.UnauthorizedException();
        }
        if (request.method === 'POST' || request.method === 'GET')
            return true;
        const commentId = this.getCommentIdFromQuery(request);
        if (!commentId) {
            throw new common_1.InternalServerErrorException('Could not find the comment.');
        }
        const comment = await this.commentsService.findCommentByCommentIdAndUserId(commentId, request.user.payload.sub);
        if (!comment) {
            throw new common_1.UnauthorizedException();
        }
        return true;
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
    getCommentIdFromQuery(request) {
        return request.query.commentId;
    }
};
exports.CommentsGuard = CommentsGuard;
exports.CommentsGuard = CommentsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        comments_service_1.CommentsService])
], CommentsGuard);
//# sourceMappingURL=comments.guard.js.map