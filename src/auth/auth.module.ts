import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../shared/prisma/prisma.service';
import { JwtStrategy } from 'src/shared/guards/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN');
        const expiresInValue: number | string | undefined = expiresIn && !isNaN(Number(expiresIn)) 
          ? Number(expiresIn) 
          : expiresIn;
        
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { 
            expiresIn: expiresInValue as any
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
