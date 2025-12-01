import { Injectable } from '@nestjs/common';
import * as OSS from 'ali-oss';

@Injectable()
export class OssService {
  private readonly client: OSS;

  constructor() {
    this.client = new OSS({
      region: 'oss-cn-hangzhou',
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: 'mapbed-wyz',
    });
  }

  /**
   @param objectName
   * @param expires 过期时间（秒），默认 300 秒（5分钟）
   */
  getUploadUrl(objectName: string, contentType: string, expires = 300) {
    const url = this.client.signatureUrl(objectName, {
      method: 'PUT',
      expires,
      headers: { 'content-type': contentType },
    });

    return {
      uploadUrl: url,
      objectName,
    };
  }
  getDownloadUrl(objectName: string, expires = 3600) {
    return this.client.signatureUrl(objectName, {
      expires,
    });
  }
}
