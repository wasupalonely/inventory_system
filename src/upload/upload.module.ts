// src/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { join } from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Usar join para crear la ruta absoluta correcta
          const uploadPath = join(process.cwd(), 'uploads');
          console.log('Upload path:', uploadPath); // Para verificar la ruta
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          console.log('Creating file:', filename); // Para verificar el nombre del archivo
          cb(null, filename);
        },
      }),
    }),
    CloudinaryModule,
  ],
  providers: [UploadService],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
