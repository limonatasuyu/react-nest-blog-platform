import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagSchema } from '../schemes/tag.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }])],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}
