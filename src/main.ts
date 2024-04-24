import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import ReqResLoggerInterceptor from 'src/common/interceptor/request-response-logger.interceptor';
import { Logger } from '@nestjs/common';
import { WinstonLoggerConfig } from './winston.config';
import * as rTracer from 'cls-rtracer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonLoggerConfig(),
  });

  app.use(rTracer.expressMiddleware());

  app.useGlobalInterceptors(new ReqResLoggerInterceptor());
  const PORT = 3000;
  await app.listen(PORT);
  Logger.log(`Server started! Listening to port: ${PORT}`, 'Bootstrap');
}
bootstrap();
