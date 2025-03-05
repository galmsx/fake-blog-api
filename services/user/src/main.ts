import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RpcServer, UserRPC, protoDir } from '@local/grpc-lib';

import { UserModule } from './app/user.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Config, Logger as CustomLogger } from '@local/common-lib';

async function bootstrap() {
  const app = await NestFactory.create(UserModule, { bufferLogs: true });

  const config = await app.resolve(Config.ConfigService);

  app.useLogger(app.get(CustomLogger.NestLoggerAdaptedService));
  const domainLogger = await app.resolve(CustomLogger.DomainLoggerService);
  app.useGlobalInterceptors(new RpcServer.ResponseInterceptor(domainLogger));

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: UserRPC.packageName,
        protoPath: UserRPC.protoPath,
        url: `localhost:${config.USER_SERVICE_PORT}`,
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
  Logger.log(`🚀 User service is running`);
}

bootstrap();
