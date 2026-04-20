import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InterceptorInterceptor } from '@libs/shared/interceptor/interceptor';
import { InterceptorExceptionFilterFilter } from '@libs/shared/interceptor/exception-filter';
import { Conifg } from '@en/config';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilterFilter());
  app.setGlobalPrefix('api'); // 设置全局前缀
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' }); // 设定版本号
  await app.listen(Conifg.ports.server);
}
bootstrap();
