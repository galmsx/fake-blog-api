import { PromiseExecutor } from '@nx/devkit';
import { GenerateDockerImageExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<GenerateDockerImageExecutorSchema> = async (
  options
) => {
  console.log('Executor ran for GenerateDockerImage', options);
  return {
    success: true,
  };
};

export default runExecutor;
