import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserRPC } from '@local/grpc-lib';
import { User } from '@local/types-lib';
import { UserRepository } from './user.repository';

@Controller()
export class UserService implements UserRPC.UserService {
  constructor(private readonly userRepository: UserRepository) { }

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
