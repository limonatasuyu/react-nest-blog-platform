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
const bson_1 = require("bson");
const promises_1 = require("node:fs/promises");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
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
    constructor(userModel, activationCodeModel) {
        this.userModel = userModel;
        this.activationCodeModel = activationCodeModel;
    }
    async activate(dto) {
        const user = await this.userModel.findOne({
            _id: dto.user_id,
        });
        if (!user) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There has been an error, please try again later.',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const activationCodes = await this.activationCodeModel.find({
            user_id: dto.user_id,
        });
        if (!activationCodes || !activationCodes.length) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There has been an error, please try again later.',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const codeToCheck = activationCodes.reduce((latest, obj) => {
            return new Date(obj.createdAt) > new Date(latest.createdAt)
                ? obj
                : latest;
        });
        if (codeToCheck.tryCount >= 3) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.BAD_REQUEST,
                error: 'Code tried out or somthin',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (Math.abs(new Date().getTime() - new Date(codeToCheck.createdAt).getTime()) >= fiveMinutesInMs) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.BAD_REQUEST,
                error: 'Activation code is timed out or smt, idk',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (Number(dto.activationCode) !== Number(codeToCheck.code)) {
            await this.activationCodeModel.updateOne({ user_id: dto.user_id }, { tryCount: codeToCheck.tryCount + 1 });
            throw new common_1.HttpException({
                status: common_1.HttpStatus.BAD_REQUEST,
                error: 'Code is incorrect',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        await this.userModel.updateOne({ _id: dto.user_id }, { isActivated: true });
        return { message: 'User activated successfully' };
    }
    async create(dto) {
        const { username, email, password } = dto;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || (await isDisposable(email))) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.BAD_REQUEST,
                error: 'Email address is not valid',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        const existingEmail = await this.userModel.findOne({ email }).exec();
        if (existingEmail) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.BAD_REQUEST,
                error: 'Email address already in use',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        const existingUsername = await this.userModel.findOne({ username }).exec();
        if (existingUsername) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.BAD_REQUEST,
                error: 'Username is already in use',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        const saltRounds = 10;
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        const activationCode = Math.floor(Math.random() * 1000000);
        const isActivationSent = await sendActivationEmail(email, activationCode);
        if (!isActivationSent) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There has been an error, please try again later.',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const createdUser = new this.userModel({
            ...dto,
            password: encryptedPassword,
            isActivated: false,
            _id: new bson_1.ObjectId(),
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
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There has been an error, please try again later.',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const activationCodes = await this.activationCodeModel.find({
            user_id: dto.user_id,
        });
        if (!activationCodes) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There has been an error, please try again later.',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const codeToCheck = activationCodes.reduce((latest, obj) => {
            return new Date(obj.createdAt) > new Date(latest.createdAt)
                ? obj
                : latest;
        });
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (Math.abs(new Date().getTime() - new Date(codeToCheck.createdAt).getTime()) < fiveMinutesInMs) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.REQUEST_TIMEOUT,
                error: 'Please wait for 5 minutes before try to create a new code',
            }, common_1.HttpStatus.REQUEST_TIMEOUT);
        }
        const activationCode = Math.floor(Math.random() * 1000000);
        const isActivationSent = await sendActivationEmail(user.email, activationCode);
        if (!isActivationSent) {
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There has been an error, please try again later.',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const createdActivationCode = new this.activationCodeModel({
            user_id: dto.user_id,
            code: activationCode,
            tryCount: 0,
            createdAt: new Date(),
        });
        await createdActivationCode.save();
        return;
    }
    async findOne(usernameOrEmail) {
        return await this.userModel.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(activationCode_schema_1.ActivationCode.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersService);
//# sourceMappingURL=user.service.js.map