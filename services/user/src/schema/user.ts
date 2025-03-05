import { User as UserTypes } from '@local/types-lib';
import { uuid, pgSchema, pgEnum, text, timestamp } from 'drizzle-orm/pg-core';

export const UserSchema = pgSchema('user');

export const UserTypeEnum = pgEnum('UserType', [UserTypes.Enum.UserType.USER]);

export const UserModel = UserSchema.table('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique(),
  name: text('name'),
  type: UserTypeEnum('type'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  password: text('password'),
});

export type UserData = typeof UserModel.$inferSelect;
export type NewUser = typeof UserModel.$inferInsert;
