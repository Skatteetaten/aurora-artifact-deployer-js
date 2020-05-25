import {
  MavenSchema,
  LATEST_METADATA_XML,
  POM_XML,
  PROJECT_METADATA_XML,
} from './templates';

describe('Templates', (): void => {
  const config: MavenSchema = {
    artifactId: 'test',
    groupId: 'com.github.skatteetaten',
    lastUpdated: '20190826200800',
    packaging: 'zip',
    version: '1',
  };

  it('should create latest-metadata.xml', (): void => {
    expect(LATEST_METADATA_XML(config).toString()).toMatchSnapshot();
  });

  it('should create pom.xml', (): void => {
    expect(POM_XML(config).toString()).toMatchSnapshot();
  });

  it('should create project-metadata.xml', (): void => {
    expect(PROJECT_METADATA_XML(config).toString()).toMatchSnapshot();
  });
});
