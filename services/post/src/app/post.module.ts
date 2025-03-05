import {
  Config,
  ExecutionContext,
  Logger,
  Drizzle,
} from '@local/common-lib';
import { Module } from '@nestjs/common';
import { RpcClientModule } from '@local/grpc-lib';
import { RPC } from '@local/types-lib';
import { COMMENT_SERVICE } from './post.constants';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';

@Module({
  imports: [
    Config.ConfigModule,
    ExecutionContext.ExecutionContextModule.forMicroservice(),
    Logger.LoggerModule,
    RpcClientModule.register(RPC.SERVICE.COMMENT, COMMENT_SERVICE),
    Drizzle.DrizzleModule,
  ],
  providers: [PostRepository],
  controllers: [PostService],
})
export class PostModule {}
