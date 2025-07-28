import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

interface CreateMulterOptionsParams {
  allowedMimeTypes?: string[];
  maxFileSizeInMB?: number;
}

export function createMulterOptions({
  allowedMimeTypes = ['image/jpeg', 'image/png'],
  maxFileSizeInMB = 2,
}: CreateMulterOptionsParams = {}): MulterOptions {
  return {
    storage: memoryStorage(),
    fileFilter: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new BadRequestException(
            `Only files of types ${allowedMimeTypes.join(', ')} are allowed.`,
          ),
          false,
        );
      }
    },
    limits: {
      fileSize: maxFileSizeInMB * 1024 * 1024, // Convert MB to bytes
    },
  };
}
