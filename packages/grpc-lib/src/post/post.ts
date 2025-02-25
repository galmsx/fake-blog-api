import { join } from 'path';
import { ClientConfig } from '../rpc-client/types';
import { Post, Common } from '@local/types-lib';


export interface PostService {
  getAllPosts(request: Post.Types.GetPostsRequest): Promise<Common.Page<Post.Types.PostWithComments>>;
}

export const serviceName = 'PostService';
export const packageName = 'post';

export const protoPath = 'post/post.proto';

export const protoDir = join(process.cwd(), '/dist/libs/grpc-lib/src');

export const postClientConfig: ClientConfig = {
  serviceName,
  packageName,
  protoPath,
  protoDir,
};
