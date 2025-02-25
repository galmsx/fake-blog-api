import { Inject, Injectable } from '@nestjs/common';
import { SERVICE } from '../constants';
import { ExecutionContext, Logger } from '@local/common-lib';
import { firstValueFrom } from 'rxjs';
import { RpcError, Status } from '../../error';

export interface FunctionTarget {
  [name: string]: (request: any, metadata: any) => any;
}

@Injectable()
export class ClientProxyHandlerService implements ProxyHandler<FunctionTarget> {
  constructor(
    @Inject(SERVICE) private readonly client: FunctionTarget,
    private readonly logger: Logger.DomainLoggerService,
    private readonly contextService: ExecutionContext.ContextService
  ) { }

  public get(target: FunctionTarget, propKey: PropertyKey): any {
    const funName = propKey as string;

    if (
      [
        'then',
        'onModuleInit',
        'onApplicationBootstrap',
        'onModuleDestroy',
        'beforeApplicationShutdown',
        'onApplicationShutdown',
      ].includes(funName)
    ) {
      return this.client[funName];
    }

    let implementation = target[funName];

    if (!implementation) {
      implementation = this.createFunction(funName);
      target[funName] = implementation;
    }

    return implementation;
  }

  private createFunction(functionName: string): (request: any) => any {
    return async (request) => {
      try {
        const metadata = this.contextService.generateMetadata();
        this.logger.info(`${functionName}.called`, request);

        const { status, data }: { status: Status; data: any } =
          await firstValueFrom(this.client[functionName](request, metadata));

        if (status !== Status.OK) {
          throw new RpcError(
            status || Status.UNKNOWN,
            'Unsuccessful status in RPC response'
          );
        }

        return data && Object.keys(data).length ? data : null;
      } catch (err: any) {
        this.logger.error(`${functionName}.callFailed`, {}, err);
        throw new RpcError(err.code, err.details);
      }
    };
  }
}
