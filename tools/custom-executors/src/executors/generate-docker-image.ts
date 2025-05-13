import { ExecutorContext } from '@nx/devkit';
import { GenerateDockerImageExecutorSchema } from './schema';
import * as fs from 'fs';
import {
  tagHelper,
  dockerHelper,
  gitHelper,
  AppType,
} from '../../utilites';
import * as _ from 'lodash';
import path = require('path');

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
      buildArgs: {
        PROJECT_NAME: context.projectName,
      }
    };
  }
};

export default async function runExecutor(
  schema: GenerateDockerImageExecutorSchema,
  context: ExecutorContext
) {

  const project = context.projectsConfigurations.projects[context.projectName];
  const tags = tagHelper.parseTags(project.tags);
  console.log(schema);
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

  // await dockerHelper.build(dockerFilePath, imageName, buildArgs);

  if (schema.ecrConfigFile) {
    const config = fs.readFileSync(path.join(process.cwd(), schema.ecrConfigFile));
    console.log(config);
  }
  else {
    console.log('ECR config file not provided');
  }

  return { success: true };
}
