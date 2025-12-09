import { Module } from '@nestjs/common';
import { ChefdeserviceService } from './chefdeservice.service';
import { ChefdeserviceController } from './chefdeservice.controller';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { EmailService } from '../shared/mail/mail.service';
import { NotificationModule } from '../shared/notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [ChefdeserviceController],
  providers: [ChefdeserviceService, EmailService],
})
export class ChefdeserviceModule { }
