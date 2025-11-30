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
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
    }),

    JwtModule.register({
      global: true,
      secret: 'wangyanzhen',
      signOptions: {
        expiresIn: '7d',
      },
    }),
    MailModule,
    UserModule,
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
