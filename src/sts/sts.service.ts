import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Credential from '@alicloud/credentials';
import * as OSS from 'ali-oss';

@Injectable()
export class StsService implements OnModuleInit {
  private client: OSS;
  constructor(private readonly configService: ConfigService) {}
  async onModuleInit() {
    const credentialsConfig = new Credential.Config({
      type: 'ram_role_arn',
      accessKeyId: this.configService.get<string>('RAM_USER_ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get<string>(
        'RAM_USER_ACCESS_KEY_SECRET',
      ),
      roleArn: this.configService.get<string>('OSS_ROLE_ARN'), // 替换 <RoleArn>
      roleSessionName: `ImgUploadSession_${Date.now()}`,
      roleSessionExpiration: 3600,
      // policy: 可选
    });

    const credentialClient = new Credential.default(credentialsConfig);

    // 初始凭证
    const credential = await credentialClient.getCredential();

    this.client = new OSS({
      region: this.configService.get<string>('OSS_REGION'),
      bucket: this.configService.get<string>('OSS_BUCKET_NAME'),
      accessKeyId: credential.accessKeyId,
      accessKeySecret: credential.accessKeySecret,
      stsToken: credential.securityToken,
      refreshSTSTokenInterval: 0,
      refreshSTSToken: async () => {
        const fresh = await credentialClient.getCredential();
        return {
          accessKeyId: fresh.accessKeyId,
          accessKeySecret: fresh.accessKeySecret,
          stsToken: fresh.securityToken,
        };
      },
    });
  }
  getClient(): OSS {
    if (!this.client) {
      throw new Error('OSS client is not initialized yet.');
    }
    return this.client;
  }
}
