import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { LOGGER_SERVICE } from '../constants';
import { LogData, Logger } from '../types';
import { ContextService } from '../../execution-context';
import { ConfigService } from '../../config';

@Injectable()
export class NestLoggerAdaptedService implements LoggerService {
  private readonly app: string;

  constructor(
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
    private readonly contextService: ContextService,
    private readonly configService: ConfigService
  ) {
    this.app = configService.APP_NAME;
  }

  private getLogData(message: any, optionalParams: any[]): LogData {
    return {
      event: 'Nest.Logger',
      message: typeof message === 'string' ? message : undefined,
      err: message instanceof Error ? message : undefined,
      sourceClass:
        optionalParams[1] || optionalParams[0]
          ? optionalParams[1] || optionalParams[0]
          : undefined,
      app: this.app,
      requestContext: this.contextService.getRequestContext(),
      body:
        typeof message === 'object' && !(message instanceof Error)
          ? message
          : undefined,
    };
  }

  public log(message: any, ...optionalParams: any[]) {
    return this.logger.info(this.getLogData(message, optionalParams));
  }

  public error(message: any, ...optionalParams: any[]) {
    return this.logger.error(this.getLogData(message, optionalParams));
  }

  public warn(message: any, ...optionalParams: any[]) {
    return this.logger.warn(this.getLogData(message, optionalParams));
  }

  public debug(message: any, ...optionalParams: any[]) {
    return this.logger.debug(this.getLogData(message, optionalParams));
  }

  public verbose(message: any, ...optionalParams: any[]) {
    return this.logger.debug(this.getLogData(message, optionalParams));
  }

  public fatal(message: any, ...optionalParams: any[]) {
    return this.logger.fatal(this.getLogData(message, optionalParams));
  }
}
