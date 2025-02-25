import { CustomContext } from '../../execution-context';

export interface LogData {
  event?: string;
  err?: Error;
  sourceClass?: string;
  app?: string;
  requestContext?: CustomContext;
  message?: string;
  body?: Record<string, any> | null;
}

export interface Logger {
  debug(data: LogData): void;
  info(data: LogData): void;
  warn(data: LogData): void;
  error(data: LogData): void;
  fatal(data: LogData): void;
}

export interface DomainLogger {
  debug(
    event: string,
    body: Record<string, any> | null,
    options?: LogData
  ): void;
  info(
    event: string,
    body: Record<string, any> | null,
    options?: LogData
  ): void;
  warn(
    event: string,
    body: Record<string, any> | null,
    error?: Error,
    options?: LogData
  ): void;
  error(
    event: string,
    body: Record<string, any> | null,
    error?: Error,
    options?: LogData
  ): void;
  fatal(
    event: string,
    body: Record<string, any> | null ,
    error?: Error,
    options?: LogData
  ): void;
}
