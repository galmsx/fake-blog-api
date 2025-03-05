import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RpcClientModule } from '@local/grpc-lib';
import { USER_SERVICE } from './auth.constants';
import { Config, ExecutionContext, Logger } from '@local/common-lib';
import { JwtModule } from '@nestjs/jwt';
import { RPC } from '@local/types-lib';

@Module({
  imports: [
    Config.ConfigModule,
    RpcClientModule.register(RPC.SERVICE.USER, USER_SERVICE),
    ExecutionContext.ExecutionContextModule.forMicroservice(),
    Logger.LoggerModule,
    JwtModule.registerAsync({
      useFactory: async (configService: Config.ConfigService) => ({
        secret: configService.JWT_SECRET,
        signOptions: { expiresIn: configService.JWT_EXPIRES_IN },
      }),
      inject: [Config.ConfigService],
    }),
  ],
  controllers: [AuthService],
})
export class AuthModule {}
