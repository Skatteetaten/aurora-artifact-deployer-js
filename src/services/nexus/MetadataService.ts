import crypto from 'crypto';

import {
  PROJECT_METADATA_XML,
  LATEST_METADATA_XML,
  POM_XML,
  MavenSchema
} from './templates';

export interface ContentMetaData {
  path: string;
  name: string;
}

export interface ContentTypes {
  artifact: ContentMetaData;
  project: ContentMetaData;
  pom: ContentMetaData;
  latest?: ContentMetaData;
}

export type FileType = keyof ContentTypes;

export interface UploadFile {
  path: string;
  name: string;
  type: FileType;
  content: Buffer;
}

export class MetadataService {
  private schema: MavenSchema;

  public constructor(schema: MavenSchema) {
    this.schema = schema;
  }

  public generateMetadataFiles(
    artifactContent: Buffer,
    classifier?: string
  ): UploadFile[] {
    const meta = this.getUploadMetadata(classifier);

    const artifactFiles = this.generateUploadFiles(
      'artifact',
      meta.artifact,
      artifactContent
    );
    const pomFiles = this.generateUploadFiles(
      'pom',
      meta.pom,
      POM_XML(this.schema)
    );
    const projectFiles = this.generateUploadFiles(
      'project',
      meta.project,
      PROJECT_METADATA_XML(this.schema)
    );

    const latestFiles = meta.latest
      ? this.generateUploadFiles(
          'latest',
          meta.latest,
          LATEST_METADATA_XML(this.schema)
        )
      : [];

    return [...artifactFiles, ...projectFiles, ...pomFiles, ...latestFiles];
  }

  private getUploadMetadata(classifier?: string): ContentTypes {
    const { artifactId, groupId, version, packaging } = this.schema;

    const applyClassifier = (text: string): string => {
      return classifier ? `${text}-${classifier}` : text;
    };

    const groupIdAsPath = groupId.replace(/\./g, '/');
    const artifactName = artifactId + '-' + version;
    const artifactNameWithClassifier = applyClassifier(artifactName);

    const files: ContentTypes = {
      project: {
        path: `${groupIdAsPath}/${artifactId}`,
        name: `maven-metadata.xml`
      },
      pom: {
        path: `${groupIdAsPath}/${artifactId}/${version}`,
        name: `${artifactName}.pom`
      },
      artifact: {
        path: `${groupIdAsPath}/${artifactId}/${version}`,
        name: `${artifactNameWithClassifier}.${packaging}`
      }
    };

    if (version.search(/.*SNAPSHOT$/i) !== -1) {
      files.latest = {
        path: `${groupIdAsPath}/${artifactId}/${version}`,
        name: `maven-metadata.xml`
      };
    }

    return files;
  }

  private generateUploadFiles(
    type: FileType,
    { name, path }: ContentMetaData,
    content: Buffer
  ): UploadFile[] {
    return [
      { path, name, content, type },
      {
        path,
        type,
        name: `${name}.md5`,
        content: this.md5(content)
      },
      {
        path,
        type,
        name: `${name}.sha1`,
        content: this.sha1(content)
      }
    ];
  }

  private md5(buf: Buffer): Buffer {
    const hash = crypto.createHash('md5');
    const content = hash.update(buf).digest('hex');
    return Buffer.from(content);
  }

  private sha1(buf: Buffer): Buffer {
    const hash = crypto.createHash('sha1');
    const content = hash.update(buf).digest('hex');
    return Buffer.from(content);
  }
}
