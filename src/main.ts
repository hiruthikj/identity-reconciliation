import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import ReqResLoggerInterceptor from 'src/common/interceptor/request-response-logger.interceptor';
import { Logger } from '@nestjs/common';
import { WinstonLoggerConfig } from './winston.config';
import * as rTracer from 'cls-rtracer';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonLoggerConfig(),
  });

  app.use(rTracer.expressMiddleware());
  app.useGlobalInterceptors(new ReqResLoggerInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Identity Reconciliatoin')
    .setDescription('API Spec')
    .setVersion('0.0.1')
    // .addTag('')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = 'docs'; 
  SwaggerModule.setup(swaggerPath, app, document);

  const PORT = 3000;
  await app.listen(PORT);
  Logger.log(`Server started! Listening to port: ${PORT}`, 'Bootstrap');

  // TODO: Better
  Logger.log(`Swagger Docs at http://localhost:${PORT}/${swaggerPath}`, 'Bootstrap');
}
bootstrap();
