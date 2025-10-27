import { Module } from '@nestjs/common';
import { ChefdeserviceService } from './chefdeservice.service';
import { ChefdeserviceController } from './chefdeservice.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { EmailService } from 'src/shared/mail/mail.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChefdeserviceController],
  providers: [ChefdeserviceService, EmailService],
})
export class ChefdeserviceModule { }
