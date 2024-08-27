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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const user_schema_1 = require("../schemes/user.schema");
const activationCode_schema_1 = require("../schemes/activationCode.schema");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose = require("mongoose");
const promises_1 = require("node:fs/promises");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const image_service_1 = require("../image/image.service");
let blocklist;
async function isDisposable(email) {
    if (!blocklist) {
        const content = await (0, promises_1.readFile)('disposable_email_blocklist.conf', {
            encoding: 'utf-8',
        });
        blocklist = content.split('\n').slice(0, -1);
    }
    return blocklist.includes(email.split('@')[1]);
}
async function sendActivationEmail(toEmail, activationCode) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        service: 'Gmail',
        auth: {
            user: 'emredilek6@gmail.com',
            pass: process.env.EMAILPASS,
        },
    });
    return new Promise(async (resolve) => {
        const mailOptions = {
            from: 'emredilek6@gmail.com',
            to: toEmail,
            subject: 'Your Activation Code',
            text: `Your activation code is: ${activationCode}`,
            html: `<p>Your activation code is: <strong>${activationCode}</strong></p>`,
        };
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
                resolve(false);
            }
            console.log('Email sent: ' + info.response);
            resolve(true);
        });
    });
}
let UsersService = class UsersService {
    constructor(userModel, activationCodeModel, imageService) {
        this.userModel = userModel;
        this.activationCodeModel = activationCodeModel;
        this.imageService = imageService;
    }
    async activate(dto) {
        const user = await this.userModel.findOne({
            _id: dto.user_id,
        });
        if (!user) {
            throw new common_1.InternalServerErrorException();
        }
        const activationCodes = await this.activationCodeModel.find({
            user_id: new mongoose.Types.ObjectId(dto.user_id),
        });
        if (!activationCodes || !activationCodes.length) {
            throw new common_1.InternalServerErrorException();
        }
        const codeToCheck = activationCodes.reduce((latest, obj) => {
            return new Date(obj.createdAt) > new Date(latest.createdAt)
                ? obj
                : latest;
        });
        if (codeToCheck.tryCount >= 3) {
            throw new common_1.BadRequestException('Too many wrong queries made, please request a new code');
        }
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (Math.abs(new Date().getTime() - new Date(codeToCheck.createdAt).getTime()) >= fiveMinutesInMs) {
            throw new common_1.BadRequestException('Too much time passed till code generated, please request a new code');
        }
        if (Number(dto.activationCode) !== Number(codeToCheck.code)) {
            await this.activationCodeModel.updateOne({ user_id: dto.user_id }, { tryCount: codeToCheck.tryCount + 1 });
            throw new common_1.BadRequestException('Code is incorrect.');
        }
        await this.userModel.updateOne({ _id: dto.user_id }, { isActivated: true });
        return { message: 'User activated successfully' };
    }
    async create(dto) {
        const { username, email, password } = dto;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || (await isDisposable(email))) {
            throw new common_1.BadRequestException('Email address is not valid.');
        }
        const existingEmail = await this.userModel.findOne({ email }).exec();
        if (existingEmail) {
            throw new common_1.BadRequestException('Email address already in use');
        }
        const existingUsername = await this.userModel.findOne({ username }).exec();
        if (existingUsername) {
            throw new common_1.BadRequestException('Username is already in use');
        }
        const saltRounds = 10;
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        const activationCode = Math.floor(Math.random() * 1000000);
        const isActivationSent = await sendActivationEmail(email, activationCode);
        if (!isActivationSent) {
            throw new common_1.InternalServerErrorException();
        }
        const createdUser = new this.userModel({
            ...dto,
            password: encryptedPassword,
            isActivated: false,
            _id: new mongoose.Types.ObjectId(),
            posts: [],
        });
        const createdActivationCode = new this.activationCodeModel({
            user_id: createdUser._id,
            code: activationCode,
            tryCount: 0,
            createdAt: new Date(),
        });
        await createdUser.save();
        await createdActivationCode.save();
        return { message: 'User created sucessfully.', user_id: createdUser._id };
    }
    async createActivationCode(dto) {
        const user = await this.userModel.findOne({ _id: dto.user_id });
        if (!user) {
            throw new common_1.InternalServerErrorException();
        }
        const activationCodes = await this.activationCodeModel.find({
            user_id: dto.user_id,
        });
        if (!activationCodes) {
            throw new common_1.InternalServerErrorException();
        }
        const codeToCheck = activationCodes.reduce((latest, obj) => {
            return new Date(obj.createdAt) > new Date(latest.createdAt)
                ? obj
                : latest;
        });
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (Math.abs(new Date().getTime() - new Date(codeToCheck.createdAt).getTime()) < fiveMinutesInMs) {
            throw new common_1.RequestTimeoutException('Please wait for 5 minutes before try to create a new code.');
        }
        let activationCode;
        do {
            activationCode = Math.floor(Math.random() * 1000000);
        } while (String(activationCode).length !== 6);
        const isActivationSent = await sendActivationEmail(user.email, activationCode);
        if (!isActivationSent) {
            throw new common_1.InternalServerErrorException();
        }
        const createdActivationCode = new this.activationCodeModel({
            user_id: dto.user_id,
            code: activationCode,
            tryCount: 0,
            createdAt: new Date(),
        });
        await createdActivationCode.save();
        return {
            message: 'Activation code created and sent to your email successfully.',
        };
    }
    async findOne(usernameOrEmail) {
        return await this.userModel.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });
    }
    async findById(userId) {
        return await this.userModel.findById(new mongoose.Types.ObjectId(userId));
    }
    async getById(user_id) {
        const user = await this.userModel.findById(new mongoose.Types.ObjectId(user_id));
        if (!user) {
            throw new common_1.InternalServerErrorException();
        }
        return {
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            profilePictureId: user.profilePictureId,
        };
    }
    async changeProfilePicture(pictureId, userId) {
        const image = await this.imageService.getImageWithId(pictureId);
        if (!image)
            throw new common_1.InternalServerErrorException();
        const updatedUser = await this.userModel.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { profilePictureId: pictureId });
        if (!updatedUser)
            throw new common_1.InternalServerErrorException();
        await this.imageService.relateImage(pictureId);
        return { message: 'Profile picture changed successfully.' };
    }
    async changeDescription(description, userId) {
        const updatedUser = await this.userModel.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $set: { description } });
        if (!updatedUser || !updatedUser.acknowledged) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Description changed successully.' };
    }
    async getRecommendedUsers() {
        const tags = await this.userModel.aggregate([
            { $addFields: { postcount: { $size: { $ifNull: ['$posts', []] } } } },
            { $sort: { postcount: 1 } },
            { $limit: 3 },
            {
                $project: {
                    _id: 0,
                    firstname: 1,
                    lastname: 1,
                    username: 1,
                    description: 1,
                },
            },
        ]);
        if (!tags) {
            throw new common_1.InternalServerErrorException();
        }
        return tags;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(activationCode_schema_1.ActivationCode.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        image_service_1.ImageService])
], UsersService);
//# sourceMappingURL=user.service.js.map