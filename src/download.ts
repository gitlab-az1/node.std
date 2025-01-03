import fs from 'fs';
import * as http from 'http';
import * as https from 'https';

import URI from './uri';
import { timestamp } from './timer';
import { Exception } from './errors';
import { chunkToBuffer } from './buffer';
import * as promises from './async/promise';
import { assertUnsignedInteger } from './asserts';
import { WeakSignal } from './engines/core/signal';
import { CancellationTokenSource, ICancellationToken } from './cancellation';
// TODO: implement LRU cache storing downloaded buffer to avoid re-download a resource

export interface IProgressEvent {
  readonly loaded: number;
  readonly total: number;
  readonly chunkLength: number;
  readonly percent: number;
  readonly estimatedTimeLeft: number;
  readonly downloadingTime: number;
}


export type ContentDownloadOverridableOptions = {
  destination?: string | URI;
  token?: ICancellationToken;
  timeout?: number;
}

export type DownloadOptions = {
  destination: string | URI;
  token?: ICancellationToken;
  timeout?: number;
}

export class DownloadService {
  readonly #progressSignal: WeakSignal;
  #source: CancellationTokenSource;

  readonly #metadata: {
    source: string;
    destination?: string;
    options: Partial<DownloadOptions>;
    startAt?: number;
    finishedAt?: number;
    bufferLength?: number;
    totalLength?: number;
    readedSize?: number;
  };

  public constructor(
    resource: string | URL | URI,
    destination: string | URI,
    options?: Omit<DownloadOptions, 'destination'>
  );

  public constructor(
    resource: string | URL | URI,
    options: DownloadOptions
  );

  public constructor(
    resource: string | URL | URI,
    destinationOrOptions: string | URI | DownloadOptions,
    options?: DownloadOptions // eslint-disable-line comma-dangle
  ) {
    const destination = typeof destinationOrOptions === 'string' || destinationOrOptions instanceof URI ?
      destinationOrOptions.toString() :
      options?.destination.toString();

    if(!destination) {
      throw new Exception('You must provide an destination to the downloaded file', 'ERR_INVALID_ARGUMENT');
    }

    const o = typeof destinationOrOptions === 'string' || destinationOrOptions instanceof URI ?
      options :
      destinationOrOptions;

    if(o?.token && o.token.isCancellationRequested) {
      throw new Exception('Asynchronous download operation was cancelled by token', 'ERR_TOKEN_CANCELED');
    }

    this.#progressSignal = new WeakSignal();
    this.#source = new CancellationTokenSource(o?.token);
    
    if(
      !(resource instanceof URI) &&
      !(resource instanceof URL)
    ) {
      resource = URI.parse(resource);
    }

    this.#metadata = {
      source: resource.toString(true),
      destination,
      options: o || {},
      bufferLength: 0,
      readedSize: 0,
      totalLength: 0,
    };

    o?.token?.onCancellationRequested(r => {
      this.#source.cancel(r);
    });
  }

  public async download(overrides?: ContentDownloadOverridableOptions): Promise<Buffer> {
    if(this.#metadata.source.startsWith('file:')) return this.#downloadFromFile(overrides);
    console.log(this.#metadata);
    const protocol = this.#metadata.source.startsWith('https:') ? https : http;

    if(overrides?.token) {
      if(overrides.token.isCancellationRequested) {
        throw new Exception('Asynchronous download operation was cancelled by token', 'ERR_TOKEN_CANCELED');
      }

      this.#source = new CancellationTokenSource(overrides.token);
      overrides.token.onCancellationRequested(r => {
        this.#source.cancel(r);
      });
    }

    const destPath = overrides?.destination?.toString() || this.#metadata.destination;

    if(!destPath) {
      throw new Exception('Cannot download resource to a undefined destination path', 'ERR_INVALID_ARGUMENT');
    }

    const _exec = async (resolve: (r: Buffer) => void, reject: (e?: unknown) => void) => {
      const ac = new AbortController();

      this.#source.token.onCancellationRequested(() => {
        ac.abort();

        if (fs.existsSync(destPath)) {
          try {
            fs.unlinkSync(destPath);
          } catch (err: any) {
            if (err.code !== 'ENOENT') {
              throw err;
            }
          }
        }

        reject(new Exception('Asynchronous download operation was cancelled by token', 'ERR_TOKEN_CANCELED'));
      });

      this.#metadata.startAt = timestamp();

      const chunks: Buffer[] = [];
      const request = protocol.request(this.#metadata.source, { signal: ac.signal, method: 'GET' }, response => {
        if(((response.statusCode || 500) / 100 | 0) !== 2) {
          reject(new Exception(`Request failed with status code ${response.statusCode}`, 'ERR_HTTP_FAILURE'));
          return;
        }

        this.#metadata.totalLength = parseInt(response.headers['content-length'] || '0', 10);

        const writeStream = fs.createWriteStream(destPath, { signal: ac.signal });

        response.on('data', async chunk => {
          const buffer = chunkToBuffer(chunk);

          if(!writeStream.write(buffer)) {
            await new Promise<void>((resolve, reject) => {
              writeStream.once('drain', resolve);
              writeStream.once('error', reject);
            });
          }

          chunks.push(buffer);

          this.#metadata.readedSize ||= 0;
          this.#metadata.readedSize += buffer.byteLength;
          this.#metadata.bufferLength = buffer.byteLength;

          this.#progressSignal.dispatch(this.#createProgressEvent());
        });

        response.on('end', () => {
          writeStream.close();
          writeStream.end();
          
          resolve(Buffer.concat(chunks));
        });

        response.on('error', reject);
      });

      request.on('error', reject);
    };

    const hasTimeout = (
      (typeof this.#metadata.options.timeout === 'number' && this.#metadata.options.timeout > 2) ||
      (typeof overrides?.timeout === 'number' && overrides?.timeout > 2)
    );

    if(hasTimeout) {
      const time = overrides?.timeout || this.#metadata.options.timeout;
      assertUnsignedInteger(time);

      return promises.withAsyncBodyAndTimeout(_exec, time);
    }

    return promises.withAsyncBody(_exec);
  }

  public on(event: 'progress', listener: (e: IProgressEvent) => void): this;
  public on(event: 'progress', listener: (e: IProgressEvent) => void): this {
    switch(event) {
      case 'progress':
        this.#progressSignal.addListener(listener);
        break;
    }

    return this;
  }

  public cancel(): void {
    this.#source.cancel();
  }

  public dispose(): void {
    this.#source.cancel();
  }

  #downloadFromFile(overrides?: ContentDownloadOverridableOptions): Promise<Buffer> {
    if(!this.#metadata.source.startsWith('file:')) {
      throw new Exception('The resource is not a local file', 'ERR_UNSUPPORTED_OPERATION');
    }

    if(overrides?.token) {
      if(overrides.token.isCancellationRequested) {
        throw new Exception('Asynchronous download operation was cancelled by token', 'ERR_TOKEN_CANCELED');
      }

      this.#source = new CancellationTokenSource(overrides.token);

      overrides.token.onCancellationRequested(r => {
        this.#source.cancel(r);
      });
    }

    const destPath = overrides?.destination?.toString() || this.#metadata.destination;

    if(!destPath) {
      throw new Exception('Cannot download resource to a undefined destination path', 'ERR_INVALID_ARGUMENT');
    }

    const _exec = async (resolve: (r: Buffer) => void, reject: (e?: unknown) => void) => {
      const ac = new AbortController();
      
      this.#source.token.onCancellationRequested(() => {
        ac.abort();

        if(fs.existsSync(destPath)) {
          try {
            fs.unlinkSync(destPath);
          } catch (err: any) {
            if(err.code !== 'ENOENT') {
              throw err;
            }
          }
        }

        reject(new Exception('Asynchronous download operation was cancelled by token', 'ERR_TOKEN_CANCELED'));
      });

      this.#metadata.startAt = timestamp();

      const chunks: Buffer[] = [];
      const stat = await fs.promises.stat(this.#metadata.source.replace(/^file:\/\//, ''));

      const readStream = fs.createReadStream(this.#metadata.source.replace(/^file:\/\//, ''), { signal: ac.signal });
      const writeStream = fs.createWriteStream(destPath, { signal: ac.signal });

      readStream.once('error', reject);
      writeStream.once('error', reject);

      readStream.on('end', () => {
        writeStream.close();
        writeStream.end();

        this.#metadata.finishedAt = timestamp();
        resolve(Buffer.concat(chunks));
      });

      readStream.on('data', async chunk => {
        try {
          const buffer = chunkToBuffer(chunk);

          if(!writeStream.write(buffer)) {
            await new Promise<void>((resolve, reject) => {
              writeStream.once('drain', resolve);
              writeStream.once('error', reject);
            });
          }

          chunks.push(buffer);

          this.#metadata.readedSize ||= 0;
          this.#metadata.readedSize += buffer.byteLength;
          this.#metadata.bufferLength = buffer.byteLength;

          this.#progressSignal.dispatch(this.#createProgressEvent());
        } catch (err) {
          reject(err);
        }
      });

      this.#metadata.readedSize = 0;
      this.#metadata.totalLength = stat.size;
      this.#progressSignal.dispatch(this.#createProgressEvent());

      await new Promise(r => {
        readStream.once('readable', r);
      });
    };

    const hasTimeout = (
      (typeof this.#metadata.options.timeout === 'number' && this.#metadata.options.timeout > 2) ||
      (typeof overrides?.timeout === 'number' && overrides?.timeout > 2)
    );

    if(hasTimeout) {
      const time = overrides?.timeout || this.#metadata.options.timeout;
      assertUnsignedInteger(time);

      return promises.withAsyncBodyAndTimeout(_exec, time);
    }

    return promises.withAsyncBody(_exec);
  }

  #createProgressEvent(): IProgressEvent {
    const { readedSize = 0, totalLength = 0, bufferLength = 0, startAt } = this.#metadata;
    
    const percent = totalLength > 0 ? (readedSize / totalLength) * 100 : 0;
    const elapsedTime = timestamp() - (startAt || 0);
    const speed = elapsedTime > 0 ? readedSize / (elapsedTime / 1000) : 0;
    const estimatedTimeLeft = speed > 0 ? ((totalLength - readedSize) / speed) : 0;
    
    return {
      loaded: readedSize,
      total: totalLength,
      chunkLength: bufferLength,
      percent,
      estimatedTimeLeft,
      downloadingTime: elapsedTime / 1000, // convert ms to seconds
    };
  }
}

export default DownloadService;
