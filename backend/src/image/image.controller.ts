import {
  Controller,
  UseGuards,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageGuard } from './image.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @UseGuards(ImageGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.imageService.createImage(file, req.user.sub);
  }

  @Get(':id')
  async getImage(@Param('id') imageId: string, @Res() res: Response) {
    const imageData = await this.imageService.getImageWithId(imageId);
    res.set('Content-Type', 'image/jpeg'); // Adjust the MIME type as necessary
    res.send(imageData);
  }
}
