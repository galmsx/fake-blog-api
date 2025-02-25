import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClsModule, ClsService } from 'nestjs-cls';
import { ContextService, ContextStore } from './execution-context.service';

@Global()
@Module({})
export class ExecutionContextModule {
  static forGateway(): DynamicModule {
    return {
      module: ExecutionContextModule,
      imports: [
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
            setup: (cls, req: any) => {
              (cls as ClsService<ContextStore>).set(
                'request_id',
                req.headers['X-Request-Id'] || crypto.randomUUID()
              );
            },
          },
        }),
      ],
      providers: [ContextService],
      exports: [ContextService],
    };
  }

  static forMicroservice(): DynamicModule {
    return {
      module: ExecutionContextModule,
      imports: [
        ClsModule.forRoot({
          global: true,
          guard: {
            mount: true,
            setup: (cls, context) => {
              const metadataMap = context.switchToRpc().getContext().getMap();
              ContextService.parseMetadata(
                metadataMap,
                cls as ClsService<ContextStore>
              );
            },
          },
        }),
      ],
      providers: [ContextService],
      exports: [ContextService],
    };
  }
}
