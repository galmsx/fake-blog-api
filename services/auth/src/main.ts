import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthRPC, RpcServer, protoDir } from '@local/grpc-lib';
import { Config, Logger as CustomLogger } from '@local/common-lib';
import { RPC } from '@local/types-lib';

import { AuthModule } from './app/auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, { bufferLogs: true });

  const config = await app.resolve(Config.ConfigService);

  app.useLogger(app.get(CustomLogger.NestLoggerAdaptedService));
  const domainLogger = await app.resolve(CustomLogger.DomainLoggerService);
  app.useGlobalInterceptors(new RpcServer.ResponseInterceptor(domainLogger));

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: AuthRPC.packageName,
        protoPath: AuthRPC.protoPath,
        url: `${config.getRpcHost(RPC.SERVICE.AUTH)}:${config.AUTH_SERVICE_PORT}`,
        loader: {
          includeDirs: [protoDir],
          keepCase: true,
        },
      },
    },
    { inheritAppConfig: true }
  );

  await app.startAllMicroservices();

  await app.init();
  Logger.log(`🚀 Auth service is running`);
}

bootstrap();
