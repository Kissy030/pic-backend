import { Injectable, Logger } from '@nestjs/common';
import Core from '@alicloud/pop-core';
import * as OSS from 'ali-oss';

// 定义返回的临时凭证类型
export interface StsCredentials {
  AccessKeyId: string;
  AccessKeySecret: string;
  SecurityToken: string;
  Expiration: string; // ISO 8601 格式的时间字符串
}

@Injectable()
export class StsService {
  private readonly logger = new Logger(StsService.name);

  // STS 客户端配置
  private readonly stsClient: Core;

  constructor() {
    // TODO: 建议将这些敏感信息移到环境变量中
    this.stsClient = new Core({
      accessKeyId: process.env.RAM_USER_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.RAM_USER_ACCESS_KEY_SECRET || '',
      endpoint: 'https://sts.aliyuncs.com',
      apiVersion: '2015-04-01',
    });
  }

  /**
   * 调用 STS AssumeRole 获取临时凭证
   * @param roleArn RAM 角色的 ARN
   * @param roleSessionName 会话名称
   * @param durationSeconds 凭证有效期（秒），最大 3600
   * @returns Promise<StsCredentials>
   */
  async assumeRole(
    roleArn: string,
    roleSessionName: string,
    durationSeconds: number = 3600,
  ): Promise<StsCredentials> {
    try {
      const params = {
        RoleArn: roleArn,
        RoleSessionName: roleSessionName,
        DurationSeconds: Math.min(durationSeconds, 3600), // 限制最大 1 小时
      };

      const requestOption = {
        method: 'POST',
      };

      this.logger.log(
        `Calling AssumeRole for RoleArn: ${roleArn}, SessionName: ${roleSessionName}`,
      );

      const result: any = await this.stsClient.request(
        'AssumeRole',
        params,
        requestOption,
      );

      const credentials: StsCredentials = result.Credentials;

      this.logger.debug('Successfully obtained temporary credentials.');
      return credentials;
    } catch (error) {
      this.logger.error('Failed to assume role via STS.', error.stack);
      throw new Error(`STS AssumeRole failed: ${error.message}`);
    }
  }

  /**
   * 使用临时凭证创建一个 OSS 客户端实例
   * @param credentials 临时凭证
   * @param region Bucket 所在区域
   * @param bucket Bucket 名称
   * @returns OSS Client 实例
   */
  createOssClient(
    credentials: StsCredentials,
    region: string,
    bucket: string,
  ): OSS {
    return new OSS({
      region: region,
      accessKeyId: credentials.AccessKeyId,
      accessKeySecret: credentials.AccessKeySecret,
      stsToken: credentials.SecurityToken,
      bucket: bucket,
    });
  }
}
