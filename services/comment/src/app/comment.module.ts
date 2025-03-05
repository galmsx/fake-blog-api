import {
  Config,
  ExecutionContext,
  Logger,
  Drizzle,
} from '@local/common-lib';
import { Module } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CommentService } from './comment.service';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    Config.ConfigModule,
    ExecutionContext.ExecutionContextModule.forMicroservice(),
    Logger.LoggerModule,
    ClsModule.forRoot({ global: true }),
    Drizzle.DrizzleModule,
  ],
  providers: [CommentRepository],
  controllers: [CommentService],
})
export class CommentModule {}
