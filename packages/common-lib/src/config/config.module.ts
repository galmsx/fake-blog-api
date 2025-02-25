import { Global, Module } from '@nestjs/common';

import { ConfigDetector } from './services/config.detector';
import { ConfigService } from './services/config.service';
import { ConfigValidator } from './services/validator';

@Global()
@Module({
  providers: [ConfigValidator, ConfigDetector, ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
