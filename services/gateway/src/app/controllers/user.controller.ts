import { Controller, Get, Inject } from '@nestjs/common';
import { UserRPC } from '@local/grpc-lib';
import { USER_SERVICE } from '../constants';

@Controller()
export class UserController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserRPC.UserService
  ) {}

  @Get()
  async getData() {
    const res = await this.userService.getUserWithPassword({ id: '4' });

    return res;
  }
}
