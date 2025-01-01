import os from 'os';
import fs from 'fs';
import path from 'path';

import { uuid } from '../uid';
import type { K } from '../types';
import * as fsbin from './binary';
import { chunkToBuffer } from '../buffer';
import { IDisposable } from '../disposable';
import { Exception, isKnownError } from '../errors';
import { ensureDir, ensureDirSync, rimraf, rimrafSync } from './core';
import { CancellationTokenSource, ICancellationToken } from '../cancellation';


export function tempdir(): string {
  const pathname = path.join(os.tmpdir(), '_');
  ensureDirSync(pathname);

  return pathname;
}


type TempState = {
  readonly pathname: string;
  readonly maxSize: number;
  sizeof: number;
  disposed: boolean;
}


export type TempOptions = {
  maxSize?: number;
};

export class TemporaryDirectory implements IDisposable {
  readonly #state: TempState;
  #source: CancellationTokenSource;

  public static create(pathname: string, options?: TempOptions): Promise<TemporaryDirectory>;
  public static create(options?: TempOptions): Promise<TemporaryDirectory>;
  public static async create(pathnameOrOptions?: string | TempOptions, options?: TempOptions): Promise<TemporaryDirectory> {
    const pathname = typeof pathnameOrOptions === 'string' ?
      pathnameOrOptions :
      path.join(tempdir(), uuid());

    await ensureDir(pathname);
    const stat = await fs.promises.stat(pathname);

    return new TemporaryDirectory(
      pathname,
      stat.size,
      options?.maxSize // eslint-disable-line comma-dangle
    );
  }

  public static createSync(pahtname: string, options?: TempOptions): TemporaryDirectory;
  public static createSync(options?: TempOptions): TemporaryDirectory;
  public static createSync(pathnameOrOptions?: string | TempOptions, options?: TempOptions): TemporaryDirectory {
    const pathname = typeof pathnameOrOptions === 'string' ?
      pathnameOrOptions :
      path.join(tempdir(), uuid());

    ensureDirSync(pathname);
    const stat = fs.statSync(pathname);

    return new TemporaryDirectory(
      pathname,
      stat.size,
      options?.maxSize // eslint-disable-line comma-dangle
    );
  }

  private constructor(
    pathname: string,
    sizeof: number = 0,
    _msize?: number // eslint-disable-line comma-dangle
  ) {
    this.#state = {
      maxSize: _msize || 4 * 1024 * 1024 * 1024,
      pathname,
      sizeof,
      disposed: false,
    };

    this.#source = new CancellationTokenSource();

    this.#source.token.onCancellationRequested(() => {
      this.#source = new CancellationTokenSource();
    });
  }

  public get dirname(): string {
    return path.basename(this.#state.pathname);
  }

  public get pathname(): string {
    return this.#state.pathname.slice(0);
  }

  public get byteLength(): number {
    return this.#state.sizeof;
  }

  public get cancellationToken(): ICancellationToken {
    return this.#source.token;
  }

  public get maxSize(): number {
    return this.#state.maxSize;
  }

  public canWriteBuffer(content: K): boolean {
    return this.#state.sizeof + chunkToBuffer(content).byteLength <= this.#state.maxSize;
  }

  public truncateWithMaxSize(content: K, throwOnOverflow: boolean = false): Buffer {
    const buffer = chunkToBuffer(content);
  
    if(this.#state.sizeof + buffer.byteLength <= this.#state.maxSize) return buffer;
  
    if(throwOnOverflow) {
      throw new Exception('Content size exceeds available space in TemporaryDirectory.', 'ERR_BUFFER_OVERFLOW');
    }
  
    return buffer.subarray(0, this.#state.maxSize - this.#state.sizeof);
  }
  
  public async write(filename: string, contents: K): Promise<void> {
    const buffer = chunkToBuffer(contents);

    if(this.#state.sizeof + buffer.byteLength > this.#state.maxSize) {
      throw new Exception(`The file '/${filename.replace(/^\//, '').replace(/^\\\\/, '')}' exceded max size of directory '${this.#state.pathname}'`, 'ERR_BUFFER_OVERFLOW');
    }

    await fs.promises.writeFile(path.join(this.#state.pathname, filename), buffer);
    this.#state.sizeof += buffer.byteLength;
  }

  public writeSync(filename: string, contents: K): void {
    const buffer = chunkToBuffer(contents);

    if(this.#state.sizeof + buffer.byteLength > this.#state.maxSize) {
      throw new Exception(`The file '/${filename.replace(/^\//, '').replace(/^\\\\/, '')}' exceded max size of directory '${this.#state.pathname}'`, 'ERR_BUFFER_OVERFLOW');
    }

    fs.writeFileSync(path.join(this.#state.pathname, filename), buffer);
    this.#state.sizeof += buffer.byteLength;
  }

  public async append(filename: string, contents: K): Promise<void> {
    const buffer = chunkToBuffer(contents);

    if(this.#state.sizeof + buffer.byteLength > this.#state.maxSize) {
      throw new Exception(`The file '/${filename.replace(/^\//, '').replace(/^\\\\/, '')}' exceded max size of directory '${this.#state.pathname}'`, 'ERR_BUFFER_OVERFLOW');
    }

    await fs.promises.appendFile(path.join(this.#state.pathname, filename), buffer);
    this.#state.sizeof += buffer.byteLength;
  }

  public appendSync(filename: string, contents: K): void {
    const buffer = chunkToBuffer(contents);

    if(this.#state.sizeof + buffer.byteLength > this.#state.maxSize) {
      throw new Exception(`The file '/${filename.replace(/^\//, '').replace(/^\\\\/, '')}' exceded max size of directory '${this.#state.pathname}'`, 'ERR_BUFFER_OVERFLOW');
    }

    fs.appendFileSync(path.join(this.#state.pathname, filename), buffer);
    this.#state.sizeof += buffer.byteLength;
  }

  public readBinary(
    filename: string,
    mask?: K,
    offset?: number | null | undefined,
    length?: number | null | undefined,
    token: ICancellationToken = this.#source.token // eslint-disable-line comma-dangle
  ): Promise<Buffer> {
    return fsbin.readBinary(
      path.join(this.#state.pathname, filename),
      mask,
      offset,
      length,
      token // eslint-disable-line comma-dangle
    );
  }

  public readBinarySync(
    filename: string,
    mask?: K,
    offset?: number,
    length?: number // eslint-disable-line comma-dangle
  ): Buffer {
    return fsbin.readBinarySync(
      path.join(this.#state.pathname, filename),
      mask,
      offset,
      length // eslint-disable-line comma-dangle
    );
  }

  public async writeBinary(
    filename: string,
    contents: K,
    mask?: K,
    token: ICancellationToken = this.#source.token,
    options?: { removeOnError?: boolean } // eslint-disable-line comma-dangle
  ): Promise<void> {
    try {
      const buffer = chunkToBuffer(contents);

      if(this.#state.sizeof + buffer.byteLength > this.#state.maxSize) {
        throw new Exception(`The file '/${filename.replace(/^\//, '').replace(/^\\\\/, '')}' exceded max size of directory '${this.#state.pathname}'`, 'ERR_BUFFER_OVERFLOW');
      }

      await fsbin.writeBinary(path.join(this.#state.pathname, filename), contents, mask, token);
      this.#state.sizeof += chunkToBuffer(contents).byteLength;
    } catch (err: any) {
      if(isKnownError(err, 'ERR_TOKEN_CANCELED') && options?.removeOnError) {
        try {
          await fs.promises.unlink(path.join(this.#state.pathname, filename));
        } catch (fsErr: any) {
          if(fsErr.code !== 'ENOENT') {
            throw fsErr;
          }
        }
      }

      throw err;
    }
  }

  public writeBinarySync(
    filename: string,
    contents: K,
    mask?: K // eslint-disable-line comma-dangle
  ): void {
    const buffer = chunkToBuffer(contents);

    if(this.#state.sizeof + buffer.byteLength > this.#state.maxSize) {
      throw new Exception(`The file '/${filename.replace(/^\//, '').replace(/^\\\\/, '')}' exceded max size of directory '${this.#state.pathname}'`, 'ERR_BUFFER_OVERFLOW');
    }
    
    fsbin.writeBinarySync(path.join(this.#state.pathname, filename), contents, mask);
    this.#state.sizeof += chunkToBuffer(contents).byteLength;
  }

  public createBinaryReadStream(
    filename: string,
    mask?: K,
    offset?: number | null | undefined,
    length?: number | null | undefined,
    token: ICancellationToken = this.#source.token // eslint-disable-line comma-dangle
  ): fs.ReadStream {
    return fsbin.createBinaryReadStream(
      path.join(this.#state.pathname, filename),
      mask,
      offset,
      length,
      token, // eslint-disable-line comma-dangle
    );
  }

  public async writeBinaryStream(
    filename: string,
    content: AsyncIterable<K> | Iterable<K>,
    mask?: K,
    token: ICancellationToken = this.#source.token,
    options?: { removeOnError?: boolean } // eslint-disable-line comma-dangle
  ): Promise<void> {
    try {
      const filepath = path.join(this.#state.pathname, filename);

      const writtenBytes = await fsbin.writeBinaryStream(
        filepath,
        content,
        mask,
        token // eslint-disable-line comma-dangle
      );

      if(this.#state.sizeof + writtenBytes > this.#state.maxSize) {
        await rimraf(filepath);
        throw new Exception(`The file '/${filename.replace(/^\//, '').replace(/^\\\\/, '')}' exceded max size of directory '${this.#state.pathname}'`, 'ERR_BUFFER_OVERFLOW');
      }
  
      this.#state.sizeof += writtenBytes;
    } catch (err: any) {
      if(isKnownError(err, 'ERR_TOKEN_CANCELED') && options?.removeOnError) {
        try {
          await fs.promises.unlink(path.join(this.#state.pathname, filename));
        } catch (fsErr: any) {
          if(fsErr.code !== 'ENOENT') {
            throw fsErr;
          }
        }
      }

      throw err;
    }
  }

  public async remove(filename: string): Promise<void> {
    try {
      const filepath = path.join(this.#state.pathname, filename);
      const stat = await fs.promises.stat(filepath);

      await rimraf(filepath, { recursive: true });
      this.#state.sizeof -= stat.size;
    } catch (err: any) {
      if(err.code === 'ENOENT') {
        throw new Exception(`'${filename}' entry not found inside '${this.#state.pathname}'`, 'ERR_RESOURCE_NOT_FOUND');
      }

      throw err;
    }
  }

  public removeSync(filename: string): void {
    try {
      const filepath = path.join(this.#state.pathname, filename);
      const stat = fs.statSync(filepath);

      rimrafSync(filepath, { recursive: true });
      this.#state.sizeof -= stat.size;
    } catch (err: any) {
      if(err.code === 'ENOENT') {
        throw new Exception(`'${filename}' entry not found inside '${this.#state.pathname}'`, 'ERR_RESOURCE_NOT_FOUND');
      }

      throw err;
    }
  }

  public list(): Promise<string[]> {
    return fs.promises.readdir(this.#state.pathname);
  }
  
  public listSync(): string[] {
    return fs.readdirSync(this.#state.pathname);
  }

  public async exists(filename: string): Promise<boolean> {
    try {
      await fs.promises.access(path.join(this.#state.pathname, filename));
      return true;
    } catch {
      return false;
    }
  }
  
  public existsSync(filename: string): boolean {
    try {
      fs.accessSync(path.join(this.#state.pathname, filename));
      return true;
    } catch {
      return false;
    }
  }

  public async clear(): Promise<void> {
    await rimraf(this.#state.pathname, { recursive: true });
    await ensureDir(this.#state.pathname);

    this.#state.sizeof = 0;
  }

  public async stat(filename: string): Promise<fs.Stats> {
    return await fs.promises.stat(path.join(this.#state.pathname, filename));
  }
  
  public statSync(filename: string): fs.Stats {
    return fs.statSync(path.join(this.#state.pathname, filename));
  }

  public clearSync(): void {
    rimrafSync(this.#state.pathname, { recursive: true });
    ensureDirSync(this.#state.pathname);

    this.#state.sizeof = 0;
  }

  public async rename(oldName: string, newName: string): Promise<void> {
    const oldPath = path.join(this.#state.pathname, oldName);
    const newPath = path.join(this.#state.pathname, newName);

    await fs.promises.rename(oldPath, newPath);
  }
  
  public renameSync(oldName: string, newName: string): void {
    const oldPath = path.join(this.#state.pathname, oldName);
    const newPath = path.join(this.#state.pathname, newName);

    fs.renameSync(oldPath, newPath);
  }

  public async copy(source: string, destination: string): Promise<void> {
    const srcPath = path.join(this.#state.pathname, source);
    const destPath = path.join(this.#state.pathname, destination);

    await fs.promises.copyFile(srcPath, destPath);
  }
  
  public copySync(source: string, destination: string): void {
    const srcPath = path.join(this.#state.pathname, source);
    const destPath = path.join(this.#state.pathname, destination);

    fs.copyFileSync(srcPath, destPath);
  }

  public resolvePath(filename: string): string {
    return path.join(this.#state.pathname, filename);
  }

  public async createSubdirectory(name: string): Promise<void> {
    const dirPath = path.join(this.#state.pathname, name);
    await ensureDir(dirPath);
  }
  
  public createSubdirectorySync(name: string): void {
    const dirPath = path.join(this.#state.pathname, name);
    ensureDirSync(dirPath);
  }

  public dispose(): void {
    if(this.#state.disposed) return;

    this.#source.cancel();
    this.#source = null!;

    rimrafSync(this.#state.pathname, { recursive: true });

    this.#state.sizeof = 0;
    this.#state.disposed = true;
  }
}

export default TemporaryDirectory;
