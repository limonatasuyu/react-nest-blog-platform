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
exports.ImageService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const images_schema_1 = require("../schemes/images.schema");
const mongoose_2 = require("mongoose");
const bson_1 = require("bson");
let ImageService = class ImageService {
    constructor(imagesModel) {
        this.imagesModel = imagesModel;
    }
    async createImage(file, user_id) {
        const createdImage = await this.imagesModel.create({
            _id: new bson_1.ObjectId(),
            imageData: file.buffer,
            user: user_id,
            createdAt: new Date(),
            isRelated: false,
        });
        if (!createdImage) {
            throw new common_1.InternalServerErrorException();
        }
        await createdImage.save();
        return { imageId: createdImage._id };
    }
    async relateImage(imageId) {
        const updatedImage = await this.imagesModel.updateOne({ _id: imageId }, { isRelated: true });
        if (!updatedImage) {
            throw new common_1.InternalServerErrorException();
        }
    }
    async getImageWithId(imageId) {
        const image = await this.imagesModel.findById(imageId).select('imageData');
        if (!image) {
            throw new common_1.InternalServerErrorException();
        }
        return image.imageData;
    }
};
exports.ImageService = ImageService;
exports.ImageService = ImageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(images_schema_1.Image.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ImageService);
//# sourceMappingURL=image.service.js.map