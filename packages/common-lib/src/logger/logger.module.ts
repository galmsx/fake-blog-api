import { Global, Module } from "@nestjs/common";
import { NestLoggerAdaptedService } from './services/nest-logger-adapted.service';
import { DomainLoggerService } from './services/domain-logger.service';
import { PinoLoggerService } from './services/pino-logger.service';
import { LOGGER_SERVICE } from './constants';

@Global()
@Module({
  providers: [
    {
      provide: LOGGER_SERVICE,
      useClass: PinoLoggerService,
    },
    DomainLoggerService,
    NestLoggerAdaptedService,
  ],
  exports: [DomainLoggerService, NestLoggerAdaptedService, LOGGER_SERVICE],
})
export class LoggerModule {}
