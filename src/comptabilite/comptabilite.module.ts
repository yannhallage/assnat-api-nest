import { Module } from '@nestjs/common';
import { ComptabiliteService } from './comptabilite.service';
import { ComptabiliteController } from './comptabilite.controller';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { NotificationModule } from '../shared/notification/notification.module';
import { UploaderModule } from '../shared/uploader/uploader.module';

@Module({
  imports: [PrismaModule, NotificationModule, UploaderModule],
  controllers: [ComptabiliteController],
  providers: [ComptabiliteService],
  exports: [ComptabiliteService],
})
export class ComptabiliteModule {}

