import { ClientConfig } from '../rpc-client/types';
import { Comment, Common } from '@local/types-lib';

export interface GetCommentsResponse {
  comments: Comment.Types.Comment[];
}

export interface GetGroupedCommentsResponse {
  groups: { itemId: Common.UUID; comments: Comment.Types.Comment[] }[];
}

export interface CommentService {
  getComments(
    options: Comment.Types.GetCommentsRequest
  ): Promise<GetCommentsResponse>;
  getGroupedComments(
    options: Comment.Types.GetGroupedCommentsRequest
  ): Promise<GetGroupedCommentsResponse>;
  healthCheck(): Promise<Common.HealthCheckData>;
}

export const serviceName = 'CommentService';
export const packageName = 'comment';

export const protoPath = 'comment/comment.proto';


export const commentClientConfig: ClientConfig = {
  serviceName,
  packageName,
  protoPath,
};
