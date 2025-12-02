import { Module } from '@nestjs/common';
import { StsService } from './sts.service';
import { ConfigModule } from '@nestjs/config';
import { StsController } from './sts.controller';

@Module({
  imports: [ConfigModule],
  controllers: [StsController],
  providers: [StsService],
})
export class StsModule {}
