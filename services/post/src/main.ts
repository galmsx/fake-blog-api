import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PostRPC, RpcServer, protoDir } from '@local/grpc-lib';
import { Config, Logger as CustomLogger } from '@local/common-lib';

import { PostModule } from './app/post.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.create(PostModule, { bufferLogs: true });

  const config = await app.resolve(Config.ConfigService);

  app.useLogger(app.get(CustomLogger.NestLoggerAdaptedService));
  const domainLogger = await app.resolve(CustomLogger.DomainLoggerService);
  app.useGlobalInterceptors(new RpcServer.ResponseInterceptor(domainLogger));

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: PostRPC.packageName,
        protoPath: PostRPC.protoPath,
        url: `0.0.0.0:${config.POST_SERVICE_PORT}`,
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
  Logger.log(`🚀 Post service is running`);
}

bootstrap();
