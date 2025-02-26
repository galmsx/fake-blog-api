import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcError, toErrorType, toHttpStatus } from '@local/grpc-lib';
import { ExecutionContext } from '@local/common-lib';
import { Response } from 'express';
import { Logger } from '@nestjs/common';

type ExceptionType = Error | RpcError | HttpException;

const logger = new Logger('AllExceptionFilter');

@Catch()
export class AllExceptionFilter implements ExceptionFilter<ExceptionType> {
  constructor(
    private readonly contextService: ExecutionContext.ContextService
  ) {}

  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const [status, message, type] = this.getErrorData(exception);

    logger.error(exception);

    response.status(status).json({
      requestId: this.contextService.getRequestId(),
      success: false,
      error: {
        status,
        type,
        message,
      },
    });
  }

  private getErrorData(
    exception: ExceptionType
  ): [HttpStatus, message: string, type: string] {
    if (exception instanceof RpcError) {
      return [
        toHttpStatus(exception.code),
        exception.message,
        toErrorType(exception.code),
      ];
    }

    if (exception instanceof HttpException) {
      if (exception instanceof BadRequestException) {
        const { message } = exception.getResponse() as {message: string};

        return [exception.getStatus(), message, exception.name];
      }

      return [exception.getStatus(), exception.message, exception.name];
    }

    return [
      HttpStatus.INTERNAL_SERVER_ERROR,
      exception.message,
      'InternalError',
    ];
  }
}
