import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { User, UserSchema } from '../schemes/user.schema';
import {
  ActivationCode,
  ActivationCodeSchema,
} from '../schemes/activationCode.schema';
import { ImageModule } from '../image/image.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ActivationCode.name, schema: ActivationCodeSchema },
    ]),
    ImageModule,
    NotificationModule,
  ],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
