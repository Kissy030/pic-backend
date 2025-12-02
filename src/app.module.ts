import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PicInfoModule } from './picInfo/picInfo.module';
import { PicInfo } from './picInfo/entities/picInfo.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { OssModule } from './oss/oss.module';
import { StsModule } from './sts/sts.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'fallback-dev-secret'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
    }),
    MailModule,
    UserModule,
    StsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql-pic-container',
      username: 'root',
      password: '123456',
      database: 'pic_db',
      entities: [User, PicInfo],
      synchronize: true,
      logging: true,
      poolSize: 10,
      connectorPackage: 'mysql2',
    }),
    PicInfoModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
