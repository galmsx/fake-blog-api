import { ExecutorContext } from '@nx/devkit';
import { GenerateDockerImageExecutorSchema } from './schema';
import * as fs from 'fs';
import {
  tagHelper,
  dockerHelper,
  gitHelper,
  AppType,
  execPromise,
} from '../../utilites';
import * as _ from 'lodash';
import path = require('path');
import { exec } from 'child_process';

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

const checkExecutionContext = (configFilePath: string) => {
  if (!process.env.AWS_REGION || !process.env.ECS_CLUSTER_NAME || !process.env.AWS_ACCOUNT_ID) {
    throw new Error('AWS_REGION, ECS_CLUSTER_NAME, AWS_ACCOUNT_ID environment variables are not set');
  };
  if (!fs.existsSync(configFilePath)) {
    throw new Error('ECR config file does not exist');
  }
}

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

  const configFilePath = path.join(process.cwd(), schema.ecrConfigFile);
  // checkExecutionContext(configFilePath);
  const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), schema.ecrConfigFile), 'utf8').split('\n').find(s => s.startsWith('{')));

  const dockerRepopsitoryUrl = config[context.projectName];

  if(!dockerRepopsitoryUrl) {
    throw new Error(`No repository URLs found for ${context.projectName}`);
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

  await dockerHelper.tag(imageName, `${dockerRepopsitoryUrl}:latest`);

  await dockerHelper.push(`${dockerRepopsitoryUrl}:latest`);
  await execPromise(`aws ecs update-service --cluster my-ecs-cluster --service  ${context.projectName} --force-new-deployment`);

  return { success: true };
}
