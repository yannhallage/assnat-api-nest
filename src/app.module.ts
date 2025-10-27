import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RhModule } from './rh/rh.module';
import { ChefdeserviceModule } from './chefdeservice/chefdeservice.module';

@Module({
  imports: [UserModule, RhModule, ChefdeserviceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
