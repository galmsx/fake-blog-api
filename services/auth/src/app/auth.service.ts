import { Controller, Inject } from '@nestjs/common';
import { AuthRPC, UserRPC } from '@local/grpc-lib';
import { Auth, User } from '@local/types-lib';
import { GrpcMethod } from '@nestjs/microservices';
import { USER_SERVICE } from './auth.constants';
import { JwtService } from '@nestjs/jwt';
import { Config } from '@local/common-lib';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 15;

@Controller()
export class AuthService implements AuthRPC.AuthService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserRPC.UserService,
    private readonly jwtService: JwtService,
    private readonly configService: Config.ConfigService
  ) {}

  @GrpcMethod()
  async validate(
    request: Auth.Types.ValidateRequest
  ): Promise<User.Types.User | null> {
    const { email } = request;

    const userWithPassword = await this.userService.getUserWithPassword({
      email,
    });

    if (
      !userWithPassword ||
      !(await bcrypt.compare(request.password, userWithPassword.password))
    ) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = userWithPassword;

    return user;
  }

  @GrpcMethod()
  async login(user: User.Types.User): Promise<Auth.Types.LoginResponse> {
    return {
      accessToken: this.jwtService.sign(user),
      refreshToken: this.generateRefreshToken(user),
      user,
    };
  }
  
  @GrpcMethod()
  async registration(request: Auth.DTO.RegisterUserDto): Promise<void> {
    const { email, name, password } = request;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return this.userService.createUser({
      email,
      name,
      password: hashedPassword,
      type: User.Enum.UserType.USER,
    });
  }

  private generateRefreshToken(user: User.Types.User) {
    return jwt.sign(user, this.configService.JWT_REFRESH, {
      expiresIn: this.configService.JWT_REFRESH_EXPIRES_IN,
    });
  }
}
