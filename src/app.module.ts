import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RhModule } from './rh/rh.module';
import { ChefdeserviceModule } from './chefdeservice/chefdeservice.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './shared/notification/notification.module';

@Module({
  imports: [UserModule, RhModule, ChefdeserviceModule, AuthModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
