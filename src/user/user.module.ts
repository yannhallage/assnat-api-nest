import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { NotificationModule } from 'src/shared/notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
