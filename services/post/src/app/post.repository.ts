import { Injectable, Inject } from '@nestjs/common';
import { Drizzle } from '@local/common-lib';
import { PostModel } from '../schema/post';
import { Post, Common } from '@local/types-lib';
import { eq, asc, desc, count } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class PostRepository {
  constructor(
    @Inject(Drizzle.DRIZZLE) private readonly db: PostgresJsDatabase
  ) {}

  async getPosts(
    options: Post.Types.GetPostsRequest
  ): Promise<Common.Page<Post.Types.Post>> {
    const { authorId, ...pageOptions } = options;

    const order =
    pageOptions.sort === Common.SortOrder.DESC
        ? desc(PostModel.createdAt)
        : asc(PostModel.createdAt);

    const data = await this.db
      .select()
      .from(PostModel)
      .where(eq(PostModel.authorId, authorId))
      .limit(pageOptions.limit)
      .offset(pageOptions.offset)
      .orderBy(order)
      .then((rows) =>
        rows.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }))
      );

    const total = await this.db
      .select({ value: count() })
      .from(PostModel)
      .where(eq(PostModel.authorId, authorId))
      .then((r) => r[0].value);

    return {
      total,
      page: pageOptions,
      data,
    };
  }
}
