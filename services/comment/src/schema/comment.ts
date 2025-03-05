import { pgSchema, text, uuid, timestamp } from 'drizzle-orm/pg-core';


export const CommentSchema = pgSchema('comment');


export const CommentModel = CommentSchema.table('comment',{
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('authorId'),
    itemId: uuid('itemId'),
    content: text('content'),
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow(),
});

export const CommentData = typeof CommentModel.$inferSelect;
export const NewComment = typeof CommentModel.$inferInsert;