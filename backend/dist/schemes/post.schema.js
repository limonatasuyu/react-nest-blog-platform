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
exports.PostSchema = exports.Post = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = require("mongoose");
const user_schema_1 = require("./user.schema");
let Post = class Post {
};
exports.Post = Post;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], Post.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: 'text' }),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", user_schema_1.User)
], Post.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose.Schema.Types.ObjectId], ref: 'Comment' }),
    __metadata("design:type", Array)
], Post.prototype, "comments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Post.prototype, "updatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, ref: 'Image' }),
    __metadata("design:type", String)
], Post.prototype, "thumbnailId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' }),
    __metadata("design:type", Array)
], Post.prototype, "likedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose.Schema.Types.ObjectId], required: true, ref: 'Tag' }),
    __metadata("design:type", Array)
], Post.prototype, "tags", void 0);
exports.Post = Post = __decorate([
    (0, mongoose_1.Schema)()
], Post);
exports.PostSchema = mongoose_1.SchemaFactory.createForClass(Post);
//# sourceMappingURL=post.schema.js.map