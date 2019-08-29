export interface MavenSchema {
  groupId: string;
  artifactId: string;
  version: string;
  packaging: string;
  lastUpdated?: string;
}

export const LATEST_METADATA_XML = ({
  artifactId,
  groupId,
  version,
  lastUpdated
}: MavenSchema): Buffer =>
  Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<metadata>
  <groupId>${groupId}</groupId>
  <artifactId>${artifactId}</artifactId>
  <version>${version}</version>
  <versioning>
    <lastUpdated>${lastUpdated}</lastUpdated>
  </versioning>
</metadata>
`);

export const POM_XML = ({
  artifactId,
  groupId,
  packaging,
  version
}: MavenSchema): Buffer =>
  Buffer.from(`<project xmlns="http://maven.apache.org/POM/4.0.0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                      http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>${groupId}</groupId>
  <artifactId>${artifactId}</artifactId>
  <version>${version}</version>
  <packaging>${packaging}</packaging>
</project>
`);

export const PROJECT_METADATA_XML = ({
  artifactId,
  groupId,
  version,
  lastUpdated
}: MavenSchema): Buffer =>
  Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<metadata>
  <groupId>${groupId}</groupId>
  <artifactId>${artifactId}</artifactId>
  <versioning>
    <latest>${version}</latest>
    <versions>
      <version>${version}</version>
    </versions>
    <lastUpdated>${lastUpdated}</lastUpdated>
  </versioning>
</metadata>
`);
