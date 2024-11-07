// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { CloudinaryConfig } from '../config/cloudinary.config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  constructor(private cloudinaryConfig: CloudinaryConfig) {
    cloudinary.config({
      cloud_name: cloudinaryConfig.instance.config().cloud_name,
      api_key: cloudinaryConfig.instance.config().api_key,
      api_secret: cloudinaryConfig.instance.config().api_secret,
    });
  }

  async uploadImage(filePath: string, folderPath: string): Promise<string> {
    try {
      if (!folderPath) {
        throw new Error(
          'folderPath debe especificarse (e.g., "products" o "user").',
        );
      }

      const result = await cloudinary.uploader.upload(filePath, {
        folder: folderPath,
      });

      // Eliminar archivo local de forma asíncrona después de la subida exitosa
      await fs.promises.unlink(filePath);

      return result.secure_url;
    } catch (error) {
      console.error('Error al subir la imagen a Cloudinary:', error.message);
      throw new Error(`Error al subir la imagen: ${error.message}`);
    }
  }
}
