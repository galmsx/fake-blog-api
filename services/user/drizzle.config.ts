/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';


export default defineConfig({
dialect: 'postgresql',
schema: './src/schema',
dbCredentials: {
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
},
});