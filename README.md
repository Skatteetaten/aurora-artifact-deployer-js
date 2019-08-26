# Aurora artifact deployer

This library is for uploading artifacts to repositories.

## Getting Started

Install

```
npm install aurora-artifact-deployer
```

## Example

```javascript
import {
  deployToNexus,
  DeployToNexusOptions,
  MavenSchema,
  NexusDeployerConfig
} from 'artifact-deployer';


const schema: MavenSchema = {
  artifactId: 'demo',
  groupId: 'no.skatteetaten.aurora',
  version: '1.0.0',
  packaging: 'tgz'
};

const config: NexusDeployerConfig = {
  artifact: 'demo-1.0.0.tgz',
  url: 'http://localhost:8081/repository/maven-releases',
  auth: {
    password: 'admin',
    username: 'admin123'
  },
  classifier: 'Webleveransepakke'
};

const options: DeployToNexusOptions = {
  parallel: true
};

deployToNexus(schema, config, options);
```
