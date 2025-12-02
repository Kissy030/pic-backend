import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StsService } from './sts.service'; // 确保路径正确

@Controller('upload')
export class StsController {
  constructor(private readonly ossService: StsService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  ) // 前端字段名为 file
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    // 可选：校验文件类型（例如只允许图片）
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException(
        'Only image files are allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const ossClient = this.ossService.getClient();

      // 构造 OSS 存储路径，例如：images/2025/12/03/abc123.png
      const key = `images/${new Date().toISOString().slice(0, 10).replace(/-/g, '/')}/${Date.now()}_${file.originalname}`;

      // 上传到 OSS
      const result = await ossClient.put(key, file.buffer, {
        mime: file.mimetype,
      });

      // 返回公网可访问的 URL（确保你的 Bucket 是 public-read 或通过 CDN）
      return {
        statusCode: HttpStatus.OK,
        message: 'Upload successful',
        url: result.url, // ali-oss 自动拼接的 URL
      };
    } catch (error) {
      console.error('OSS Upload Error:', error);
      throw new HttpException(
        'Failed to upload image to OSS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
