import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import {
  Config,
  ExecutionContext,
  Logger,
  Drizzle,
} from '@local/common-lib';
import { ClsModule } from 'nestjs-cls';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    Config.ConfigModule,
    ClsModule.forRoot({ global: true }),
    Logger.LoggerModule,
    ExecutionContext.ExecutionContextModule.forMicroservice(),
    Drizzle.DrizzleModule,
  ],
  providers: [UserRepository],
  controllers: [UserService],
})
export class UserModule {}
