import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InterceptorInterceptor } from '@libs/shared/interceptor/interceptor';
import { InterceptorExceptionFilterFilter } from '@libs/shared/interceptor/exception-filter';
import { Conifg } from '@en/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilterFilter());
  await app.listen(Conifg.ports.server);
}
bootstrap();
