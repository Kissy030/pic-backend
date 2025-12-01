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
   * @param expires 
   */

  async getUploadUrl(objectName: string, contentType: string) {
    const uploadUrl = this.client.signatureUrl(objectName, {
      method: 'PUT',
      expires: 3600,
      mime: contentType.trim(),
    });

    return {
      uploadUrl,
      accessUrl: `https://mapbed-wyz.oss-cn-hangzhou.aliyuncs.com/${objectName}`,
    };
  }
  getDownloadUrl(objectName: string, expires = 3600) {
    return this.client.signatureUrl(objectName, {
      expires,
    });
  }
}
