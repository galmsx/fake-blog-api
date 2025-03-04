import { User } from '@local/types-lib';
import { ClientConfig } from '../rpc-client/types';

export interface UserService {
  getUserWithPassword(
    findOptions: User.Types.UserFindOptions
  ): Promise<User.Types.UserWithPassword | null>;
  createUser(request: User.Types.CreateUserRequest): Promise<void>;
}

export const serviceName = 'UserService';
export const packageName = 'user';

export const protoPath = 'user/user.proto';


export const userClientConfig: ClientConfig = {
  serviceName: 'UserService',
  packageName: 'user',
  protoPath: 'user/user.proto',
};
