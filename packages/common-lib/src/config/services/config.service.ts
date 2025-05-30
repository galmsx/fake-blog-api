import { Injectable, Inject } from '@nestjs/common';
import { Config } from '../types/config';
import { ConfigDetector } from './config.detector';
import { RPC } from '@local/types-lib';

@Injectable()
export class ConfigService {
  private readonly config: Config;

  constructor(@Inject(ConfigDetector) private readonly configDetector: ConfigDetector) {
    this.config = this.configDetector.getConfig();
  }

  get NODE_ENV(): string {
    return this.config.NODE_ENV;
  }

  get AUTH_SERVICE_PORT(): string {
    return this.config.AUTH_SERVICE_PORT;
  }

  get POST_SERVICE_PORT(): string {
    return this.config.POST_SERVICE_PORT;
  }

  get COMENT_SERVICE_PORT(): string {
    return this.config.COMMENT_SERVICE_PORT;
  }

  get USER_SERVICE_PORT(): string {
    return this.config.USER_SERVICE_PORT;
  }

  get GATEWAY_PORT(): string {
    return this.config.GATEWAY_PORT;
  }

  get JWT_SECRET(): string {
    return this.config.JWT_SECRET;
  }

  get JWT_EXPIRES_IN(): string {
    return this.config.JWT_EXPIRES_IN;
  }

  get JWT_REFRESH(): string {
    return this.config.JWT_REFRESH;
  }

  get JWT_REFRESH_EXPIRES_IN(): string {
    return this.config.JWT_REFRESH_EXPIRES_IN;
  }

  get APP_NAME(): string {
    return 'APP_NAME';
  }

  get(key: keyof Config): string {
    return this.config[key];
  }

  getRpcHost(service: RPC.SERVICE): string {
    return this.NODE_ENV === 'development' ? `localhost` : `${service.toLowerCase()}.${service.toLowerCase()}`;
  }

  getRpcClientPort(service: RPC.SERVICE): string {
    switch (service) {
      case RPC.SERVICE.AUTH:
        return this.AUTH_SERVICE_PORT;
      case RPC.SERVICE.USER:
        return this.USER_SERVICE_PORT;
      case RPC.SERVICE.POST:
        return this.POST_SERVICE_PORT;
      case RPC.SERVICE.COMMENT:
        return this.COMENT_SERVICE_PORT;
      default:
        throw Error('Unknown service');
    }
  }

  isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }
}
