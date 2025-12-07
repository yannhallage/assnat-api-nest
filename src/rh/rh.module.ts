import { Module } from '@nestjs/common';
import { RhService } from './rh.service';
import { RhController } from './rh.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { EmailService } from 'src/shared/mail/mail.service';
import { UploaderModule } from 'src/shared/uploader/uploader.module';

@Module({
  imports: [PrismaModule, UploaderModule],
  controllers: [RhController],
  providers: [RhService, EmailService],
})
export class RhModule {}
