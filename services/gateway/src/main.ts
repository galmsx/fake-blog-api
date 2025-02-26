import {
  ExecutionContext,
  Logger as CustomLogger,
} from '@local/common-lib';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Config } from '@local/common-lib';
import { AllExceptionFilter } from './app/filters/exception.filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ResponseTransformInterceptor } from './app/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const contextService = await app.resolve(ExecutionContext.ContextService);
  const config = await app.resolve(Config.ConfigService);

  app.useLogger(app.get(CustomLogger.NestLoggerAdaptedService));
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionFilter(contextService));
  app.setGlobalPrefix('api');

  await app.listen(config.GATEWAY_PORT);

  Logger.log(`🚀 Application is running`);
}

bootstrap();
