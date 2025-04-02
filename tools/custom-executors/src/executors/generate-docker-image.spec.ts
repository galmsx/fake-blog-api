import { ExecutorContext } from '@nx/devkit';

import { GenerateDockerImageExecutorSchema } from './schema';
import executor from './generate-docker-image';

const options: GenerateDockerImageExecutorSchema = {};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
  projectGraph: {
    nodes: {},
    dependencies: {},
  },
  projectsConfigurations: {
    projects: {},
    version: 2,
  },
  nxJsonConfiguration: {},
};

describe.skip('GenerateDockerImage Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
