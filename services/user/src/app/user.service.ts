import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserRPC } from '@local/grpc-lib';
import { User } from '@local/types-lib';
import { UserRepository } from './user.repository';

@Controller()
export class UserService implements UserRPC.UserService {
  constructor(@Inject(UserRepository) private readonly userRepository: UserRepository) { }

  @GrpcMethod()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async healthCheck(): Promise<void> {
  };

  @GrpcMethod()
  async getUserWithPassword(
    findOptions: User.Types.UserFindOptions
  ): Promise<User.Types.UserWithPassword | null> {
    return this.userRepository.getUserWithPassword(findOptions);
  }

  @GrpcMethod()
  async createUser(request: User.Types.CreateUserRequest): Promise<void> {
    return this.userRepository.createUser(request);
  }
}
