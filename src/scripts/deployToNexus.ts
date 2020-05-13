import { readFileSync, writeFileSync } from 'fs';
import { NexusDeployerConfig } from '../services/nexus/NexusDeployer';
import { NexusDeployer } from '../services/nexus/NexusDeployer';
import {
  MetadataService,
  FileType,
  UploadFile,
} from '../services/nexus/MetadataService';
import { getLastUpdatedTime } from '../utils/date';
import { mkdirp } from '../utils/files';
import { MavenSchema } from '../services/nexus/templates';

export interface DeployToNexusOptions {
  outDir?: string;
  parallel?: boolean;
  debug?: boolean;
  excludeFileTypes?: FileType[];
  writeMetadataFiles?: boolean;
}

type FilterFileTypeFunc = (file: UploadFile) => boolean;

const filterFiles = (
  excludeTypes: FileType[] | undefined
): FilterFileTypeFunc => (file: UploadFile) => {
  if (excludeTypes === undefined || excludeTypes.length === 0) {
    return true;
  }
  return !excludeTypes.includes(file.type);
};

export async function deployToNexus(
  schema: MavenSchema,
  config: NexusDeployerConfig,
  options: DeployToNexusOptions
): Promise<void> {
  if (!schema.lastUpdated) {
    schema.lastUpdated = getLastUpdatedTime();
  }

  const metadataService = new MetadataService(schema);
  const artifactContent = readFileSync(config.artifact);
  const files = metadataService
    .generateMetadataFiles(artifactContent, config.classifier)
    .filter(filterFiles(options.excludeFileTypes));
  if (options.debug) {
    files.forEach((file) => console.log(file.path, file.name));
  }

  if (options.writeMetadataFiles) {
    if (!options.outDir) {
      throw new Error('outDir is requried when enabling writeMetadataFiles');
    }

    files.forEach((file) => {
      const dirPath = `${options.outDir}/${file.path}`;
      mkdirp(dirPath);
      writeFileSync(`${dirPath}/${file.name}`, file.content);
    });
  }
  const deployer = new NexusDeployer(config);

  const createPromise = (file: UploadFile): (() => Promise<string>) => () => {
    return new Promise<string>((resolve, reject) => {
      const path = `${file.path}/${file.name}`;
      deployer.uploadContent(file.content, path, resolve, reject);
    });
  };

  const uploadFuncs = files.map(createPromise);
  const handleUploadFunc = async (fn: () => Promise<string>): Promise<void> => {
    const file = await fn();
    console.log('Uploaded', file);
  };

  const isArtifactFile = (file: UploadFile): boolean =>
    file.type === 'artifact' &&
    !['md5', 'sha1'].includes(file.name.split('.').pop() || '');

  const artifactIndex = files.findIndex(isArtifactFile);

  // Upload artifact first to prevent uploading the rest if it failes.
  if (artifactIndex >= 0) {
    await handleUploadFunc(uploadFuncs[artifactIndex]);
    uploadFuncs.splice(artifactIndex, 1);
  }

  if (options.parallel) {
    await Promise.all(uploadFuncs.map((fn) => handleUploadFunc(fn)));
  } else {
    for (let x = 0; x < uploadFuncs.length; x++) {
      await handleUploadFunc(uploadFuncs[x]);
    }
  }
}
