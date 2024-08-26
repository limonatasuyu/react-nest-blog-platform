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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const bcrypt_1 = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const user_schema_1 = require("../schemes/user.schema");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(usersService, jwtService, userModel) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.userModel = userModel;
    }
    async login(dto) {
        const user = await this.usersService.findOne('username' in dto ? dto.username : dto.email);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const { password, _id, username } = user;
        const isPasswordsMatch = await (0, bcrypt_1.compare)(dto.password, password);
        if (!isPasswordsMatch) {
            throw new common_1.UnauthorizedException('Password is incorrect.');
        }
        const payload = { sub: _id, username };
        return {
            access_token: await this.jwtService.signAsync(payload),
            message: 'Login successfull.',
        };
    }
    async getChangePasswordToken(userId, currentPassword) {
        const user = await this.usersService.findById(userId);
        if (!user)
            throw new common_1.InternalServerErrorException('User not found.');
        const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
        const passwordLastUpdatedAt = new Date(user.passwordLastUpdatedAt).getTime();
        const currentTime = new Date().getTime();
        if (passwordLastUpdatedAt &&
            currentTime - passwordLastUpdatedAt < ONE_MONTH_IN_MS) {
            throw new common_1.UnauthorizedException('Your password has been changed in the last month. Please wait before trying to change it again.');
        }
        console.log(currentPassword, user);
        const isPasswordsMatch = await (0, bcrypt_1.compare)(currentPassword, user.password);
        if (!isPasswordsMatch) {
            throw new common_1.UnauthorizedException('Password is incorrect.');
        }
        const payload = {
            sub: userId,
            passwordHash: user.password,
        };
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '5m',
        });
        return { token };
    }
    async changePassword(newPassword, newPasswordAgain, userId, token) {
        await this.verifyChangePasswordToken(token);
        if (newPassword !== newPasswordAgain) {
            throw new common_1.InternalServerErrorException('Passwords do not match');
        }
        const saltRounds = 10;
        const encryptedPassword = await bcrypt.hash(newPassword, saltRounds);
        const updatedUser = await this.userModel.updateOne({ _id: new mongoose_2.default.Types.ObjectId(userId) }, { password: encryptedPassword, passwordLastUpdatedAt: new Date() });
        if (!updatedUser || !updatedUser.matchedCount) {
            throw new common_1.InternalServerErrorException();
        }
        return { message: 'Password changed succesfully.' };
    }
    async verifyChangePasswordToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.usersService.findById(payload.sub);
            if (!user)
                throw new common_1.UnauthorizedException('User not found.');
            if (user.password !== payload.passwordHash) {
                throw new common_1.UnauthorizedException('Token verification failed.');
            }
            return user;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token verification failed.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [user_service_1.UsersService,
        jwt_1.JwtService,
        mongoose_2.Model])
], AuthService);
//# sourceMappingURL=auth.service.js.map