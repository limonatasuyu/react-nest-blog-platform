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
exports.TagService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tag_schema_1 = require("../schemes/tag.schema");
let TagService = class TagService {
    constructor(tagModel) {
        this.tagModel = tagModel;
    }
    async findOne(name) {
        return await this.tagModel.findOne({ name });
    }
    async getPopularTags() {
        const tags = await this.tagModel
            .find()
            .sort({ postCount: -1 })
            .limit(3)
            .populate('name');
        if (!tags) {
            throw new common_1.InternalServerErrorException();
        }
        return tags;
    }
    async createTag(tagName) {
        const createdTag = this.tagModel.create({
            _id: new mongoose_2.default.Types.ObjectId(),
            name: tagName.toLowerCase(),
            postCount: 0,
        });
        if (!createdTag) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Tag created successfully.' };
    }
    async createTagsForPost(tags) {
        const tagNames = tags.map((tag) => tag.toLowerCase());
        const bulkOps = tagNames.map((tag) => ({
            updateOne: {
                filter: { name: tag },
                update: {
                    $inc: { postCount: 1 },
                    $setOnInsert: {
                        _id: new mongoose_2.default.Types.ObjectId(),
                    },
                },
                upsert: true,
            },
        }));
        await this.tagModel.bulkWrite(bulkOps);
        const allTags = await this.tagModel
            .find({ name: { $in: tagNames } })
            .select('_id')
            .exec();
        return allTags;
    }
};
exports.TagService = TagService;
exports.TagService = TagService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tag_schema_1.Tag.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TagService);
//# sourceMappingURL=tag.service.js.map