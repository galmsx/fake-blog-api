import { Inject, Injectable, Scope } from '@nestjs/common';
import { DomainLogger, LogData, Logger } from '../types';
import { LOGGER_SERVICE } from '../constants';
import { INQUIRER } from '@nestjs/core';
import { ContextService } from '../../execution-context';
import { ConfigService } from '../../config';

@Injectable({ scope: Scope.TRANSIENT })
export class DomainLoggerService implements DomainLogger {
  private sourceClass: string;
  private readonly app: string;

  constructor(
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
    @Inject(INQUIRER) parentClass: object,
    private readonly contextService: ContextService,
    private readonly configService: ConfigService
  ) {
    this.sourceClass = parentClass?.constructor?.name;
    this.app = configService.APP_NAME;
  }

  public setContext(context: string) {
    this.sourceClass = context;
  }

  private getLogData(
    event: string,
    body: Record<string, any> | null = null,
    error?: Error,
    options?: LogData
  ): LogData {
    return {
      event,
      err: error,
      sourceClass: options?.sourceClass || this.sourceClass,
      app: options?.app || this.app,
      requestContext: this.contextService.getRequestContext(),
      message: options?.message,
      body,
    };
  }

  debug(
    event: string,
    body: Record<string, any> | null = null,
    options?: LogData
  ) {
    this.logger.debug(this.getLogData(event, body, undefined, options));
  }

  info(
    event: string,
    body: Record<string, any> | null = null,
    options?: LogData
  ) {
    this.logger.info(this.getLogData(event, body, undefined, options));
  }

  warn(
    event: string,
    body: Record<string, any> | null = null,
    error?: Error,
    options?: LogData
  ) {
    this.logger.warn(this.getLogData(event, body, error, options));
  }

  error(
    event: string,
    body: Record<string, any> | null = null,
    error?: Error,
    options?: LogData
  ) {
    this.logger.error(this.getLogData(event, body, error, options));
  }

  fatal(
    event: string,
    body: Record<string, any> | null = null,
    error?: Error,
    options?: LogData
  ) {
    this.logger.fatal(this.getLogData(event, body, error, options));
  }
}
