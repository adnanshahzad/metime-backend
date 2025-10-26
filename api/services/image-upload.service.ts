import { Injectable, BadRequestException } from '@nestjs/common';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageUploadService {
  private readonly uploadPath = 'uploads/services';
  private readonly thumbnailPath = 'uploads/services/thumbnails';

  constructor() {
    // Ensure upload directories exist
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
    if (!existsSync(this.thumbnailPath)) {
      mkdirSync(this.thumbnailPath, { recursive: true });
    }
  }

  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB.');
    }
  }

  private generateUniqueFileName(originalName: string): string {
    const ext = extname(originalName);
    return `${uuidv4()}${ext}`;
  }

  async uploadImage(file: Express.Multer.File): Promise<{ imagePath: string; thumbnailPath: string }> {
    this.validateImageFile(file);

    const fileName = this.generateUniqueFileName(file.originalname);
    const imagePath = join(this.uploadPath, fileName);
    const thumbnailPath = join(this.thumbnailPath, fileName);

    try {
      // Save original image
      await sharp(file.buffer)
        .jpeg({ quality: 90 })
        .toFile(imagePath);

      // Generate thumbnail (300x300)
      await sharp(file.buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return {
        imagePath: imagePath.replace(/\\/g, '/'), // Convert backslashes to forward slashes for URLs
        thumbnailPath: thumbnailPath.replace(/\\/g, '/')
      };
    } catch (error) {
      throw new BadRequestException('Failed to process image: ' + error.message);
    }
  }

  async deleteImage(imagePath: string, thumbnailPath: string): Promise<void> {
    const fs = require('fs').promises;
    
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }

    try {
      await fs.unlink(thumbnailPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }
}
