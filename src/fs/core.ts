import fs from 'fs';
import path from 'path';

import { Exception } from '../errors';
import { FOLDER_PERMISSION } from './const';


export async function ensureDir(dirname: fs.PathLike): Promise<void> {
  try {
    const stat = await fs.promises.stat(dirname);

    if(!stat.isDirectory()) {
      throw new Exception('Path exists but is not a directory', 'ERR_PATH_IS_A_FILE');
    }
  } catch (err: any) {
    if(err.code === 'ENOENT') {
      await fs.promises.mkdir(dirname, {
        recursive: true,
        mode: FOLDER_PERMISSION,
      });
    } else {
      throw err;
    }
  }
}


export function ensureDirSync(dirname: fs.PathLike): void {
  try {
    const stat = fs.statSync(dirname);

    if(!stat.isDirectory()) {
      throw new Exception('Path exists but is not a directory', 'ERR_PATH_IS_A_FILE');
    }
  } catch (err: any) {
    if(err.code === 'ENOENT') {
      fs.mkdirSync(dirname, {
        recursive: true,
        mode: FOLDER_PERMISSION,
      });
    } else {
      throw err;
    }
  }
}


export type FSOptions = {
  recursive?: boolean;
};


export async function rimraf(pathname: fs.PathLike, options?: FSOptions): Promise<void> {
  try {
    const stat = await fs.promises.lstat(pathname);

    if(stat.isSymbolicLink()) {
      await fs.promises.unlink(pathname);
      return; 
    }

    if(stat.isDirectory()) {
      const recursiveMode = options?.recursive ?? true;
      const contents = await fs.promises.readdir(pathname);

      if(!recursiveMode && contents.length > 0) {
        throw new Exception('The directory is not empty', 'ERR_UNSUPPORTED_OPERATION');
      }

      await Promise.all( contents.map(item => rimraf(path.join(pathname.toString(), item), options)) );

      await fs.promises.rmdir(pathname);
    } else {
      await fs.promises.unlink(pathname);
    }
  } catch (err: any) {
    if(err.code !== 'ENOENT') {
      throw err;
    }
  }
}

export function rimrafSync(pathname: fs.PathLike, options?: FSOptions): void {
  try {
    const stat = fs.lstatSync(pathname);

    if(stat.isSymbolicLink()) {
      fs.unlinkSync(pathname);
      return;
    }

    if(stat.isDirectory()) {
      const recursiveMode = options?.recursive ?? true;
      const contents = fs.readdirSync(pathname);

      if(!recursiveMode && contents.length > 0) {
        throw new Exception('The directory is not empty', 'ERR_UNSUPPORTED_OPERATION');
      }

      for(const item of contents) {
        rimrafSync(path.join(pathname.toString(), item), options);
      }

      fs.rmdirSync(pathname);
    } else {
      fs.unlinkSync(pathname);
    }
  } catch (err: any) {
    if(err.code !== 'ENOENT') {
      throw err;
    }
  }
}


export async function hasFolders(pathname: fs.PathLike): Promise<boolean> {
  try {
    const dc = await fs.promises.readdir(pathname);

    for(const entry of dc) {
      const entryStat = await fs.promises.lstat(path.join(pathname.toString(), entry));
      if(entryStat.isDirectory()) return true;
    }
  } catch (err: any) {
    if(err.code !== 'ENOENT') {
      throw err;
    }
  }

  return false;
}

export function hasFoldersSync(pathname: fs.PathLike): boolean {
  try {
    const dc = fs.readdirSync(pathname);

    for(const entry of dc) {
      const entryStat = fs.lstatSync(path.join(pathname.toString(), entry));
      if(entryStat.isDirectory()) return true;
    }
  } catch(err: any) {
    if(err.code !== 'ENOENT') {
      throw err;
    }
  }

  return false;
}
