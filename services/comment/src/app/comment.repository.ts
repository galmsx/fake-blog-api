import { Drizzle } from '@local/common-lib';
import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Comment, Common } from '@local/types-lib';
import { RpcError, Status } from '@local/grpc-lib';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { CommentModel } from '../schema/comment';
import { CommentRPC } from '@local/grpc-lib';

@Injectable()
export class CommentRepository {
  constructor(
    @Inject(Drizzle.DRIZZLE) private readonly db: PostgresJsDatabase
  ) { }

  async getComments(
    options: Comment.Types.GetCommentsRequest
  ): Promise<Comment.Types.Comment[]> {
    if (
      !(
        options.authorId &&
        options.itemId &&
        options.authorIds &&
        options.itemIds
      )
    ) {
      throw new RpcError(
        Status.INVALID_ARGUMENT,
        'Atleast one option required'
      );
    }

    const queryConditions = [];

    if (options.authorId) {
      queryConditions.push(eq(CommentModel.authorId, options.authorId));
    }

    if (options.itemId) {
      queryConditions.push(eq(CommentModel.itemId, options.itemId));
    }

    if (options.itemIds) {
      queryConditions.push(inArray(CommentModel.itemId, options.itemIds));
    }

    if (options.authorIds) {
      queryConditions.push(inArray(CommentModel.authorId, options.authorIds));
    }

    return this.db
      .select()
      .from(CommentModel)
      .where(and(...queryConditions))
      .then((rows) =>
        rows.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }))
      );
  }

  async getGroupedComments(
    options: Comment.Types.GetGroupedCommentsRequest
  ): Promise<CommentRPC.GetGroupedCommentsResponse> {
    const res = (await this.db
      .select({
        itemId: CommentModel.itemId,
        comments: sql`
       array_agg(json_build_object(
      'id', id,
      'authorId',"authorId" ,
      'itemId',"itemId", 
      'content', "content",
      'createdAt',"createdAt", 
      'updatedAt', "updatedAt"
      ))`,
      })
      .from(CommentModel)
      .where(inArray(CommentModel.itemId, options.itemIds))
      .groupBy(CommentModel.itemId)) as {
        itemId: Common.UUID;
        comments: Comment.Types.Comment[];
      }[];

    return { groups: res };
  }
}
