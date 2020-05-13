import fs from 'fs';

function directoryExists(dir: string): boolean {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (e) {
    const error = e as NodeJS.ErrnoException;
    // error is thrown by statSync when path does not exist
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

export function mkdirp(dir: string): void {
  dir
    .split('/')
    .reduce((paths: string[], next: string): string[] => {
      return paths.length === 0
        ? [next]
        : [
            ...paths,
            paths
              .slice(paths.length - 1)
              .concat(next)
              .join('/'),
          ];
    }, [])
    .forEach((path): void => {
      if (!directoryExists(path)) {
        try {
          fs.mkdirSync(path);
        } catch (e) {
          console.log(e);
        }
      }
    });
}
