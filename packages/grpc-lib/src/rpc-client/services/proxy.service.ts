import { Inject, Injectable } from '@nestjs/common';
import { ClientProxyHandlerService } from './proxy-handler.service';

@Injectable()
export class ProxyService {
  constructor(
    @Inject(ClientProxyHandlerService) private readonly clientProxyHandlerService: ClientProxyHandlerService
  ) {
    return new Proxy({}, clientProxyHandlerService) as any;
  }
}
