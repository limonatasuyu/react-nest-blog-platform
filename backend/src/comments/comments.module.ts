import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PostsModule } from '../posts/posts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../schemes/comment.schema';
import { Post, PostSchema } from '../schemes/post.schema';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    PostsModule,
    NotificationModule,
    UserModule,
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
