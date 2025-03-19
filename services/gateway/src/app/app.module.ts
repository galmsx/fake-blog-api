import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { Config, ExecutionContext, Logger } from '@local/common-lib';
import { RpcClientModule } from '@local/grpc-lib';
import { AUTH_SERVICE, POST_SERVICE, USER_SERVICE, COMMENT_SERVICE } from './constants';
import { RPC } from '@local/types-lib';
import { AuthController } from './controllers/auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PostController } from './controllers/post.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    Config.ConfigModule,
    PassportModule,
    RpcClientModule.register(RPC.SERVICE.USER, USER_SERVICE),
    RpcClientModule.register(RPC.SERVICE.AUTH, AUTH_SERVICE),
    RpcClientModule.register(RPC.SERVICE.POST, POST_SERVICE),
    RpcClientModule.register(RPC.SERVICE.COMMENT, COMMENT_SERVICE),
    ExecutionContext.ExecutionContextModule.forGateway(),
    Logger.LoggerModule,
  ],
  controllers: [UserController, AuthController, PostController, HealthController],
  providers: [LocalStrategy, JwtStrategy],
})
export class AppModule { }
