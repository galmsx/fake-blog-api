import { execPromise } from './exec-promise';
type Nullable<T> = T | null;
import * as _ from 'lodash';

export const dockerHelper = {
  build: async (
    dockerFilePath: string,
    tag: string,
    buildArgs?: Record<string, string>
  ): Promise<void> => {
    const buildArgValues = Object.keys(buildArgs || {})
      .map((key) => {
        return `--build-arg ${key}=${buildArgs![key]}`.replace('\n', '');
      })
      .join(' ');

    await execPromise(
      `docker build -f ${dockerFilePath} ${buildArgValues} -t ${tag} .`
    );
  },
  tag: async (localTag: string, externalTag: string): Promise<void> => {
    await execPromise(`docker tag ${localTag} ${externalTag}`);
  },
  push: async (externalTag: string): Promise<void> => {
    await execPromise(`docker push ${externalTag}`);
  },
  query: async (query: string): Promise<Nullable<string[]>> => {
    const values = await execPromise(`docker images -q ${query}`);
    return values.split('\n').filter((w) => !_.isEmpty(w));
  }
};