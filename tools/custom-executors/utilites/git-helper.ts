import { execPromise } from './exec-promise';
import * as _ from "lodash";

export const gitHelper = {
  latestCommitHash: async () =>
    (await execPromise('git rev-parse --short HEAD')).replace('\n', '').trim(),
  changedFiles: async (branchName = 'main'): Promise<string[]> => {
    const changedFiles = await execPromise(
      `git diff --name-only ${branchName}~1`
    );
    return changedFiles.split('\n').filter((v) => !_.isEmpty(v));
  }
};