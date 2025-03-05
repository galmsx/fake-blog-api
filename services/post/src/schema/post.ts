import { pgSchema, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const PostSchema = pgSchema('post');

export const PostModel = PostSchema.table('post', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('authorId'),
  title: text('title'),
  content: text('content'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const PostData = typeof PostModel.$inferSelect;
export const NewPost = typeof PostModel.$inferInsert;
