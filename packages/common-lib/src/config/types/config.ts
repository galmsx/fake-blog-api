export interface Config {
  NODE_ENV: string;
  AUTH_SERVICE_PORT: string;
  USER_SERVICE_PORT: string;
  POST_SERVICE_PORT: string;
  COMMENT_SERVICE_PORT: string;
  GATEWAY_PORT: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH: string;
  JWT_REFRESH_EXPIRES_IN: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
}
