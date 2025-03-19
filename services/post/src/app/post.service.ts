import { Controller, Inject } from '@nestjs/common';
import { PostRPC, CommentRPC } from '@local/grpc-lib';
import { Post, Common } from '@local/types-lib';
import { PostRepository } from './post.repository';
import { COMMENT_SERVICE } from './post.constants';
import { GrpcMethod } from '@nestjs/microservices';


@Controller()
export class PostService implements PostRPC.PostService {
  constructor(
    @Inject(COMMENT_SERVICE)
    private readonly commentService: CommentRPC.CommentService,
    private readonly postRepository: PostRepository
  ) { }

  @GrpcMethod()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async healthCheck(): Promise<void> {
  };

  @GrpcMethod()
  async getAllPosts(
    request: Post.Types.GetPostsRequest
  ): Promise<Common.Page<Post.Types.PostWithComments>> {
    const { page, total, data } = await this.postRepository.getPosts(request);

    const postIds = data.map((p) => p.id);

    const { groups: commentsGroups } =
      await this.commentService.getGroupedComments({
        itemIds: postIds,
      });

    const postsWithComments: Post.Types.PostWithComments[] = data.map(
      (post) => ({
        ...post,
        comments:
          commentsGroups.find((g) => g.itemId === post.id)?.comments || [],
      })
    );

    return {
      page,
      total,
      data: postsWithComments,
    };
  }
}
