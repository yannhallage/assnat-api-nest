import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploaderService } from './uploader.service';
import { UploaderController } from './uploader.controller';

@Module({
  imports: [ConfigModule],
  controllers: [UploaderController],
  providers: [UploaderService],
  exports: [UploaderService],
})
export class UploaderModule {}

