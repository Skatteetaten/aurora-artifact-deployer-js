import http, { RequestOptions } from 'http';

export interface NexusAuthentication {
  username: string;
  password: string;
}

export interface NexusDeployerConfig {
  artifact: string;
  url: string;
  classifier?: string;
  auth?: NexusAuthentication;
}

export class NexusDeployer {
  private config: NexusDeployerConfig;

  public constructor(config: NexusDeployerConfig) {
    this.config = config;
  }

  public uploadContent(
    fileContent: Buffer,
    targetFile: string,
    handleSuccess: (file: string) => void,
    handleError: (err: Error) => void
  ): void {
    const { auth } = this.config;
    const url = new URL(this.config.url);
    const targetFilePath = `${url.pathname}/${targetFile}`;

    const reqOptions: RequestOptions = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      path: targetFilePath,
      method: 'PUT',
      auth: auth && `${auth.username}:${auth.password}`,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileContent.byteLength
      }
    };

    const req = http.request(reqOptions, res => {
      res.setEncoding('utf8');
      res.on('data', chunk => {
        console.log(chunk);
      });
      res.on('error', handleError);
      res.on('end', () => {
        if (res.statusCode && res.statusCode < 400) {
          handleSuccess(`${this.config.url}/${targetFile}`);
        } else {
          handleError(
            new Error(
              `Failed to upload file=${targetFile} status=${res.statusCode} message=${res.statusMessage}`
            )
          );
        }
      });
    });

    req.on('error', handleError);
    req.write(fileContent);
    req.end();
  }
}
