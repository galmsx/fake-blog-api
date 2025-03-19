import { ExecutorContext } from '@nx/devkit';
import { GenerateDockerImageExecutorSchema } from './schema';
import {
  tagHelper,
  dockerHelper,
  gitHelper,
  AppType,
} from '../../utilites';
import * as _ from 'lodash';

type DockerBuildArgs = {
  imageName: string,
  buildArgs?: Record<string, string>,
}

type DockerBuildArgsFunc = (
  context: ExecutorContext
) => Promise<DockerBuildArgs>;


const dockerBuildArgs: Record<AppType, DockerBuildArgsFunc> = {
  ['microservice']: async (context): Promise<DockerBuildArgs> => {
    const latestCommitHash = await gitHelper.latestCommitHash();
    const imageName = `${context.projectName}:${latestCommitHash}`;

    return {
      imageName,
    };
  }
};

export default async function runExecutor(
  schema: GenerateDockerImageExecutorSchema,
  context: ExecutorContext
) {
  const project = context.projectsConfigurations.projects[context.projectName];
  const tags = tagHelper.parseTags(project.tags);
  const projectType = new Set<AppType>([
    'microservice'
  ]);
  const dockerFilePath = project.root + '/.dockerfile';

  if (!projectType.has(tags['app-type'] as AppType)) {
    throw new Error(
      `${context.projectName} is not an application of type api-app or base`
    );
  }

  const {
    imageName,
    buildArgs,
  } = await dockerBuildArgs[tags['app-type']](context);

  const images = await dockerHelper.query(imageName);

  if (!_.isEmpty(images)) {
    console.log(`${imageName} already exists.  Image will not be created.`);
    return {
      success: true
    }
  };

  await dockerHelper.build(dockerFilePath, imageName, buildArgs);

  return { success: true };
}
