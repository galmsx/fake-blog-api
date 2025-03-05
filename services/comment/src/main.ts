import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CommentRPC, RpcServer, protoDir } from '@local/grpc-lib';
import { Config, Logger as CustomLogger } from '@local/common-lib';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { CommentModule } from './app/comment.module';

async function bootstrap() {
  const app = await NestFactory.create(CommentModule, { bufferLogs: true });

  const config = await app.resolve(Config.ConfigService);

  app.useLogger(app.get(CustomLogger.NestLoggerAdaptedService));
  const domainLogger = await app.resolve(CustomLogger.DomainLoggerService);
  app.useGlobalInterceptors(new RpcServer.ResponseInterceptor(domainLogger));

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: CommentRPC.packageName,
        protoPath: CommentRPC.protoPath,
        url: `localhost:${config.COMENT_SERVICE_PORT}`,
        loader: {
          includeDirs: [protoDir],
          keepCase: true,
        }
      }
    },
    { inheritAppConfig: true }
  );

  await app.startAllMicroservices();
  await app.init();
  Logger.log(`🚀 Comment service is running`);
}

bootstrap();
