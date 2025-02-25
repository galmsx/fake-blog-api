import { Module } from '@nestjs/common';
import * as Config from '../config';
import { ConfigService } from '../config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { DRIZZLE, QUERY_CLIENT } from './drizzle.constants';

@Module({
  imports: [Config.ConfigModule],
  providers: [
    {
      provide: QUERY_CLIENT,
      useFactory: (config: ConfigService) =>
        postgres({
          host: config.get('DB_HOST'),
          port: Number(config.get('DB_PORT')),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_DATABASE'),
        }),
      inject: [ConfigService],
    },
    {
      provide: DRIZZLE,
      useFactory: (qC: postgres.Sql) => drizzle(qC, { logger: true }),
      inject: [QUERY_CLIENT],
    },
  ],
  exports: [QUERY_CLIENT, DRIZZLE],
})
export class DrizzleModule {}
