import { Module } from '@nestjs/common';
import { ChefdeserviceService } from './chefdeservice.service';
import { ChefdeserviceController } from './chefdeservice.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { EmailService } from 'src/shared/mail/mail.service';
import { NotificationModule } from 'src/shared/notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [ChefdeserviceController],
  providers: [ChefdeserviceService, EmailService],
})
export class ChefdeserviceModule { }
