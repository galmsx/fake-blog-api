import { join } from 'path';
import { User, Auth } from '@local/types-lib';
import { ClientConfig } from '../rpc-client/types';

export interface AuthService {
  validate(
    request: Auth.Types.ValidateRequest
  ): Promise<User.Types.User | null>;
  login(user: User.Types.User): Promise<Auth.Types.LoginResponse>;
  registration(request: Auth.DTO.RegisterUserDto): Promise<void>;
}

export const serviceName = 'AuthService';
export const packageName = 'auth';

export const protoPath = 'auth/auth.proto';

export const protoDir = join(process.cwd(), '/dist/libs/grpc-lib/src');

export const authClientConfig: ClientConfig = {
  serviceName: 'AuthService',
  packageName: 'auth',
  protoPath: 'auth/auth.proto',
  protoDir: protoDir,
};
