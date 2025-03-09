import * as fs from 'fs';

import * as dotenv from 'dotenv';
import { Injectable, Inject } from '@nestjs/common';

import { ENV_FILE_PATH } from '../constants';
import { Config } from '../types/config';

import { ConfigValidator } from './validator';
import process from 'process';

@Injectable()
export class ConfigDetector {
  constructor(@Inject(ConfigValidator) private readonly validator: ConfigValidator) {}

  public getConfig(): Config {
    let rawConfig: Record<string, string>;
    console.log(ENV_FILE_PATH);
    const fileAvailable: boolean =
      this.checkConfigFileAvailability(ENV_FILE_PATH);

    if (fileAvailable) {
      const fileContent = fs.readFileSync(ENV_FILE_PATH);

      rawConfig = dotenv.parse(fileContent);
    } else {
      console.log('CONFIG NOT AVAILABLE:' + ENV_FILE_PATH);

      rawConfig = process.env as Record<string, string>;
    }

    const config: Config = this.validator.validate(rawConfig);

    return config;
  }

  private checkConfigFileAvailability(path: string): boolean {
    try {
      fs.accessSync(path, fs.constants.R_OK);

      return true;
    } catch (err) {
      return false;
    }
  }
}
