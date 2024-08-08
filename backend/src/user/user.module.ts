import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModuleController } from './user.controller';
import { UsersService } from './user.service';
import { User, UserSchema } from '../schemes/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserModuleController],
  providers: [UsersService],
})
export class UserModule {}

