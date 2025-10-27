import { Module } from '@nestjs/common';
import { RhService } from './rh.service';
import { RhController } from './rh.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { EmailService } from 'src/shared/mail/mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [RhController],
  providers: [RhService, EmailService],
})
export class RhModule {}
