import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { OssService } from './oss.service';

@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) {}

  @Get('upload-url')
  getUploadUrl(
    @Query('fileName') fileName: string,
    @Query('contentType') contentType: string,
    @Query('dir') dir = 'user-uploads/',
  ) {
    if (!fileName) {
      throw new BadRequestException('fileName is required');
    }

    if (fileName.includes('..') || fileName.startsWith('/')) {
      throw new BadRequestException('Invalid file name');
    }

    // 构造 OSS 路径
    const objectName = `${dir}${fileName}`;

    const { uploadUrl } = this.ossService.getUploadUrl(
      objectName,
      contentType,
      300,
    ); // 5分钟有效

    return {
      uploadUrl,
      objectName,
      accessUrl: `https://mapbed-wyz.oss-cn-hangzhou.aliyuncs.com/${objectName}`,
    };
  }
}
