import {
  Controller,
  Post,
  Req,
  Res,
  Logger,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { StsService, StsCredentials } from './sts.service'; // 确保路径正确
import * as OSS from 'ali-oss';
import { ConfigService } from '@nestjs/config'; // 推荐使用 ConfigService

@Controller('upload')
export class StsController {
  private readonly logger = new Logger(StsController.name);

  constructor(
    private readonly stsService: StsService,
    private readonly configService: ConfigService, // 注入 ConfigService 读取环境变量
  ) {}

  /**
   * 处理 POST /upload/image 路由，用于上传图片
   * 使用 FileInterceptor 拦截名为 'image' 的文件字段
   */
  @Post('image')
  @UseInterceptors(FileInterceptor('image')) // 'image' 是前端 FormData 中文件的 key
  async uploadImage(
    @UploadedFile() file: Express.Multer.File, // 获取上传的文件
    @Res() res: Response,
  ) {
    // 1. 基本校验
    if (!file) {
      this.logger.warn('No file uploaded.');
      throw new BadRequestException('No file provided.');
    }

    // 可选：增加文件类型校验
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`Invalid file type uploaded: ${file.mimetype}`);
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      );
    }

    // 可选：增加文件大小限制 (例如 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5 MB in bytes
    if (file.size > maxFileSize) {
      this.logger.warn(`File too large: ${file.size} bytes`);
      throw new BadRequestException('File size exceeds the limit of 5MB.');
    }

    try {
      // 2. 获取临时凭证 (从环境变量读取配置)
      const ROLE_ARN = this.configService.get<string>('OSS_ROLE_ARN');
      const ROLE_SESSION_NAME = `ImgUploadSession_${Date.now()}`; // 使用唯一会话名
      const REGION = this.configService.get<string>('OSS_REGION');
      const BUCKET_NAME = this.configService.get<string>('OSS_BUCKET_NAME');

      // 简单校验配置是否存在
      if (!ROLE_ARN || !REGION || !BUCKET_NAME) {
        this.logger.error(
          'Missing required environment variables for OSS configuration.',
        );
        throw new Error('Server configuration error: Missing OSS settings.');
      }

      const credentials: StsCredentials = await this.stsService.assumeRole(
        ROLE_ARN,
        ROLE_SESSION_NAME,
        3600, // 1小时
      );

      // 3. 使用临时凭证创建 OSS 客户端
      const ossClient: OSS = this.stsService.createOssClient(
        credentials,
        REGION,
        BUCKET_NAME,
      );

      // 4. 生成 OSS 对象名 (例如: images/uuid.jpg)
      // 使用 UUID 或时间戳确保唯一性，防止覆盖
      const fileExtension = file.originalname.split('.').pop(); // 获取原始扩展名
      const objectName = `images/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;

      // 5. 上传文件到 OSS
      // file.buffer 包含了文件的二进制数据
      const putResult = await ossClient.put(objectName, file.buffer);

      this.logger.log(
        `Successfully uploaded image ${objectName} to OSS. URL: ${putResult.url}`,
      );

      // 6. 返回成功响应，通常返回图片的 URL
      return res.status(201).json({
        message: 'Image uploaded successfully.',
        url: putResult.url, // 这是图片的公网访问地址
        objectName: objectName, // 可选：返回对象名，方便后续管理
      });
    } catch (error) {
      this.logger.error('Image upload failed', error.stack);
      // 根据错误类型返回不同状态码和消息
      if (error instanceof BadRequestException) {
        return res.status(400).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: 'Internal server error during image upload.' });
    }
  }
}
