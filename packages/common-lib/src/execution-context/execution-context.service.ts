import { Injectable, Inject } from '@nestjs/common';
import { ClsService, ClsStore } from 'nestjs-cls';
import { User } from '@local/types-lib';
import { Metadata } from '@grpc/grpc-js';

export class CustomContext {
  // initial values for property names list
  request_id?: string = undefined;
  user_id?: string = undefined;
  user_type?: User.Enum.UserType = undefined;
}
const contextKeys = Object.keys(new CustomContext()) as (keyof CustomContext)[];

export interface ContextStore extends ClsStore, CustomContext { }

@Injectable()
export class ContextService {
  constructor(@Inject(ClsService) private readonly cls: ClsService<ContextStore>) { }

  public getRequestId(): string {
    return this.cls.get('request_id');
  }

  public generateMetadata(): Metadata {
    const metadata = new Metadata();

    for (const key of contextKeys) {
      const contextParameter: string = this.cls.get(key);
      if (contextParameter) {
        metadata.set(key, contextParameter);
      }
    }
    return metadata;
  }

  public static parseMetadata(metadata: any, cls: ClsService<ContextStore>) {
    for (const key of contextKeys) {
      cls.set(key, metadata[key]);
    }
  }

  public setUserInfo(user: User.Types.User) {
    this.cls.set('user_id', user.id);
    this.cls.set('user_type', user.type);
  }

  public getRequestContext(): CustomContext {
    return {
      request_id: this.cls.get('request_id'),
      user_id: this.cls.get('user_id') || undefined,
      user_type: this.cls.get('user_type') || undefined,
    };
  }
}
