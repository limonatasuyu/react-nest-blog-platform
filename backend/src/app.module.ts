import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UserModule,
    PostsModule,
    AuthModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/blog'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
