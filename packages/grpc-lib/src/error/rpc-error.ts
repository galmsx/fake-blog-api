import { RpcException } from '@nestjs/microservices';
import { Status } from './types';

export class RpcError extends RpcException {
  public readonly code: Status;

  constructor(status: Status, message: string, stack?: string) {
    super({message, code: status});
    this.code = status;
    this.stack = stack;
  }
}
