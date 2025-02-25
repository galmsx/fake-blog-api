import * as Joi from 'joi';

import { Config } from '../types/config';

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),
  AUTH_SERVICE_PORT: Joi.string(),
  USER_SERVICE_PORT: Joi.string(),
  POST_SERVICE_PORT: Joi.string(),
  COMMENT_SERVICE_PORT: Joi.string(),
  GATEWAY_PORT: Joi.string(),
  JWT_SECRET: Joi.string(),
  JWT_EXPIRES_IN: Joi.string(),
  JWT_REFRESH: Joi.string(),
  JWT_REFRESH_EXPIRES_IN: Joi.string(),
  DB_HOST: Joi.string(),
  DB_PORT: Joi.string(),
  DB_USERNAME: Joi.string(),
  DB_PASSWORD: Joi.string(),
  DB_DATABASE: Joi.string(),
});

export class ConfigValidator<T = any> {
  public validate(value: T): Config {
    const config = Joi.attempt(value, schema, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    }) as Config;

    return config;
  }
}
