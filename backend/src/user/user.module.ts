import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModuleController } from './user.controller';
import { UsersService } from './user.service';
import { User, UserSchema } from '../schemes/user.schema';
import { ActivationCode, ActivationCodeSchema } from 'src/schemes/activationCode.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: ActivationCode.name, schema: ActivationCodeSchema }]),
  ],
  controllers: [UserModuleController],
  providers: [UsersService],
})
export class UserModule {}

