import { Global, Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { ResponseModule } from './response/response.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Conifg } from '@en/config';
import { config } from 'dotenv';
import { MinioModule } from './minio/minio.module';

@Global()
@Module({
  providers: [SharedService],
  exports: [
    SharedService,
    PrismaModule,
    ResponseModule,
    ConfigModule,
    JwtModule,
    MinioModule,
  ],
  imports: [
    PrismaModule,
    ResponseModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY'),
        signOptions: { expiresIn: 10 },
      }),
    }),
    MinioModule,
  ],
})
export class SharedModule {}
