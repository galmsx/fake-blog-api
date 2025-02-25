import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Status } from '../../error/types';
import { Logger as CustomLogger } from '@local/common-lib';
import { RpcException } from '@nestjs/microservices';
import { RpcError } from '../../error';
import { PostgresError } from 'postgres';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger.DomainLoggerService) {
    this.logger.setContext('ResponseInterceptor');
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<any>> {
    const args = context.getArgs()[0];

    const route = `${context.getClass().name}.${context.getHandler().name}`;

    this.logger.info(`${route}.execution`, args);

    return next.handle().pipe(
      map((data) => {
        this.logger.info(`${route}.executionSuccess`);
        return { status: Status.OK, data };
      }),
      catchError((error) =>
        throwError(() => {
          this.logger.error(`${route}.executionFailed`, args, error);

          if (error instanceof RpcException) {
            return error;
          }

          if (error instanceof PostgresError && error.code === '23505') {
            return new RpcError(
              Status.ALREADY_EXISTS,
              error.message,
              error.stack
            );
          }

          return new RpcError(Status.UNKNOWN, error.message, error.stack);
        })
      )
    );
  }
}
