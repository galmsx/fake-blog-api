import { Injectable } from '@nestjs/common';
import { ClientProxyHandlerService } from './proxy-handler.service';

@Injectable()
export class ProxyService {
  constructor(
    private readonly clientProxyHandlerService: ClientProxyHandlerService
  ) {
    return new Proxy({}, clientProxyHandlerService) as any;
  }
}
