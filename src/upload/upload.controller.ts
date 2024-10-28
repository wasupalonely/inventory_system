// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderPath') folderPath: string,
  ): Promise<{ url: string }> {
    const filePath = file.path;
    const url = await this.uploadService.uploadImage(filePath, folderPath);

    return { url };
  }
}
