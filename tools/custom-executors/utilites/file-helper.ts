import { readFileSync } from 'fs';
import { createHash } from 'crypto';

export const fileHelper = {
  getFileHash: (filePaths: string[]): string => {
    const hashedValues = filePaths
      .map((path) => {
        return createHash('md5')
          .update(readFileSync(path))
          .digest('hex')
          .replace('\n', '');
      })
      .join('_');

    return createHash('md5')
      .update(hashedValues, 'base64')
      .digest('hex')
      .replace('\n', '');
  }
};