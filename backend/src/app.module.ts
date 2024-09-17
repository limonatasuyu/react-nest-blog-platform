import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CommentsModule } from './comments/comments.module';
import { ImageModule } from './image/image.module';
import { TagModule } from './tag/tag.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    PostsModule,
    AuthModule,
    MongooseModule.forRoot(process.env.NODE_ENV !== "production" ? 'mongodb://127.0.0.1:27017/blog?replicaSet=rs0' : process.env.DB_URL),
    CommentsModule,
    ImageModule,
    TagModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
