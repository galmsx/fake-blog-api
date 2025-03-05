import { Inject, Injectable } from '@nestjs/common';
import { User } from '@local/types-lib';
import { UserModel } from '../schema/user';
import { Drizzle } from '@local/common-lib';
import { eq, and } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(Drizzle.DRIZZLE) private readonly db: PostgresJsDatabase
  ) { }

  async getUserWithPassword(
    findOptions: User.Types.UserFindOptions
  ): Promise<User.Types.UserWithPassword | null> {
    const queryConditions = [];

    if (findOptions.email) {
      queryConditions.push(eq(UserModel.email, findOptions.email));
    }

    if (findOptions.id) {
      queryConditions.push(eq(UserModel.id, findOptions.id));
    }

    return (
      await this.db
        .select()
        .from(UserModel)
        .where(and(...queryConditions))
    ).shift();
  }

  async createUser(request: User.Types.CreateUserRequest) {
    await this.db.insert(UserModel).values({
      id: crypto.randomUUID(),
      email: request.email,
      name: request.name,
      type: request.type,
      password: request.password,
    });
  }
}
