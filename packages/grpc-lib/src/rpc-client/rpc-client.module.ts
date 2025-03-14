import { Module, DynamicModule } from '@nestjs/common';
import { Config } from '@local/common-lib';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { authClientConfig } from '../auth/auth';
import { userClientConfig } from '../user/user';
import { postClientConfig } from '../post/post';
import { commentClientConfig } from '../comment/comment';
import { RPC } from '@local/types-lib';
import { ClientConfig } from './types';
import { ClientProxyHandlerService } from './services/proxy-handler.service';
import { ProxyService } from './services/proxy.service';
import { SERVICE } from './constants';
import { protoDir } from '../constants';

const serviceConfigMap = {
  [RPC.SERVICE.AUTH]: authClientConfig,
  [RPC.SERVICE.USER]: userClientConfig,
  [RPC.SERVICE.COMMENT]: commentClientConfig,
  [RPC.SERVICE.POST]: postClientConfig,
};

@Module({})
export class RpcClientModule {
  private static getServiceConfig(service: RPC.SERVICE): ClientConfig {
    return serviceConfigMap[service];
  }

  static register(service: RPC.SERVICE, token: string): DynamicModule {
    const packageName = `${service}_PACKAGE`;
    const serviceConfig = this.getServiceConfig(service);

    return {
      module: RpcClientModule,
      imports: [
        Config.ConfigModule,
        ClientsModule.registerAsync([
          {
            name: packageName,
            useFactory: (config: Config.ConfigService) => ({
              transport: Transport.GRPC,
              options: {
                package: serviceConfig.packageName,
                protoPath: serviceConfig.protoPath,
                url: `localhost:${config.getRpcClientPort(service)}`,
                loader: {
                  includeDirs: [protoDir],
                  keepCase: true,
                },
              },
            }),
            inject: [Config.ConfigService],
          },
        ]),
      ],
      providers: [
        {
          provide: SERVICE,
          useFactory: (client: ClientGrpc) =>
            client.getService(serviceConfig.serviceName),
          inject: [packageName],
        },
        ClientProxyHandlerService,
        { provide: token, useClass: ProxyService },
      ],
      exports: [token],
    };
  }
}
