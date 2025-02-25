import { Injectable } from '@nestjs/common';
import { LogData, Logger } from '../types';
import Pino from 'pino';

@Injectable()
export class PinoLoggerService implements Logger {
  private readonly logger = Pino({});

  debug(data: LogData): void {
    const { message, ...rest } = data;
    this.logger.debug(rest, message);
  }

  info(data: LogData): void {
    const { message, ...rest } = data;
    this.logger.info(rest, message);
  }

  warn(data: LogData): void {
    const { message, ...rest } = data;
    this.logger.warn(rest, message);
  }

  error(data: LogData): void {
    const { message, ...rest } = data;
    this.logger.error(rest, message);
  }

  fatal(data: LogData): void {
    const { message, ...rest } = data;
    this.logger.fatal(rest, message);
  }
}
