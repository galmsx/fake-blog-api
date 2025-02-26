import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_SERVICE } from '../constants';
import { AuthRPC } from '@local/grpc-lib';
import { User } from '@local/types-lib';
import { ExecutionContext } from '@local/common-lib';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AUTH_SERVICE) private authService: AuthRPC.AuthService,
    private readonly contextService: ExecutionContext.ContextService
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(
    username: string,
    password: string
  ): Promise<User.Types.User | never> {
    const user = await this.authService.validate({
      email: username,
      password,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    this.contextService.setUserInfo(user);

    return user;
  }
}
