import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from 'src/schemes/post.schema';
import { User, UserSchema } from 'src/schemes/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { ImageModule } from 'src/image/image.module';
import { TagModule } from 'src/tag/tag.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
    ImageModule,
    TagModule,
    NotificationModule
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
