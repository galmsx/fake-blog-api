import { ClientConfig } from '../rpc-client/types';
import { Post, Common } from '@local/types-lib';


export interface PostService {
  getAllPosts(request: Post.Types.GetPostsRequest): Promise<Common.Page<Post.Types.PostWithComments>>;
  healthCheck(): Promise<void>;
}

export const serviceName = 'PostService';
export const packageName = 'post';

export const protoPath = 'post/post.proto';

export const postClientConfig: ClientConfig = {
  serviceName,
  packageName,
  protoPath,
};
