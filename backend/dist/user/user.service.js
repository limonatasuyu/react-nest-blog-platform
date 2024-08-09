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
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
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
    constructor(userModel) {
        this.userModel = userModel;
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
            activationCode,
        });
        return await createdUser.save();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=user.service.js.map