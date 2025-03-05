import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommentRPC } from '@local/grpc-lib';
import { Comment } from '@local/types-lib';
import { CommentRepository } from './comment.repository';

@Controller()
export class CommentService implements CommentRPC.CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  @GrpcMethod()
  async getComments(
    options: Comment.Types.GetCommentsRequest
  ): Promise<CommentRPC.GetCommentsResponse> {
    const comments = await this.commentRepository.getComments(options);

    return { comments };
  }

  @GrpcMethod()
  async getGroupedComments(
    options: Comment.Types.GetGroupedCommentsRequest
  ): Promise<CommentRPC.GetGroupedCommentsResponse> {
    return this.commentRepository.getGroupedComments(options);
  }
}
