import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModuleModule } from './user-module/user-module.module';
import { PostsModuleModule } from './posts-module/posts-module.module';
import { AuthModuleModule } from './auth-module/auth-module.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UserModuleModule,
    PostsModuleModule,
    AuthModuleModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/blog'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
