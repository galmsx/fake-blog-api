/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

console.log(process.env.DB_HOST);
console.log(111111);


export default defineConfig({
dialect: 'postgresql',
schema: './bundledschema/',
dbCredentials: {
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
},
});