import fs from 'fs';
import { Transform } from 'stream';

import type { K } from '../types';
import { isNumber } from '../util';
import { Exception } from '../errors';
import * as promises from '../async/promise';
import { CancellationToken, ICancellationToken } from '../cancellation';
import { chunkToBuffer, unmask as unmaskBuffer, mask as maskBuffer } from '../buffer';


export async function readBinary(
  filepath: fs.PathLike,
  mask?: K,
  offset?: number | null | undefined,
  length?: number | null | undefined,
  token?: ICancellationToken // eslint-disable-line comma-dangle
): Promise<Buffer> {
  if(token && token.isCancellationRequested) {
    throw new Exception('Asynchronous file read was cancelled by token', 'ERR_TOKEN_CANCELED');
  }

  return promises.withAsyncBody<Buffer>(async (resolve, reject) => {
    const ac = token ? new AbortController() : null;

    (token || CancellationToken.None).onCancellationRequested(() => {
      ac?.abort();
      reject(new Exception('Asynchronous file read was cancelled by token', 'ERR_TOKEN_CANCELED'));
    });

    const buffer = await fs.promises.readFile(filepath, { signal: ac?.signal });

    if(mask) {
      unmaskBuffer(buffer, chunkToBuffer(mask), { avoidBufferUtils: true, pad: true });
    }

    if(!isNumber(offset) && !isNumber(length)) return void resolve(buffer);
    if(!isNumber(length)) return void resolve(buffer.subarray(offset ?? 0));
    resolve(buffer.subarray((offset ?? 0), (offset ?? 0) + length));
  });
}

export function readBinarySync(
  filepath: fs.PathLike,
  mask?: K,
  offset?: number,
  length?: number // eslint-disable-line comma-dangle
): Buffer {
  const buffer = fs.readFileSync(filepath);

  if(mask) {
    unmaskBuffer(buffer, chunkToBuffer(mask), { avoidBufferUtils: true, pad: true });
  }

  if(!isNumber(offset) && !isNumber(length)) return buffer;
  if(!isNumber(length)) return buffer.subarray(offset);
  return buffer.subarray((offset ?? 0), (offset ?? 0) + length);
}


export async function writeBinary(
  filepath: fs.PathLike,
  contents: K,
  mask?: K,
  token?: ICancellationToken // eslint-disable-line comma-dangle
): Promise<void> {
  if(token && token.isCancellationRequested) {
    throw new Exception('Asynchronous file write was cancelled by token', 'ERR_TOKEN_CANCELED');
  }

  return promises.withAsyncBody<void>(async (resolve, reject) => {
    const ac = token ? new AbortController() : null;

    (token || CancellationToken.None).onCancellationRequested(() => {
      ac?.abort();
      reject(new Exception('Asynchronous file write was cancelled by token', 'ERR_TOKEN_CANCELED'));
    });

    let buffer = chunkToBuffer(contents);

    if(mask) {
      const output = Buffer.alloc(buffer.length);

      maskBuffer(buffer, chunkToBuffer(mask), output, 0, buffer.length, { avoidBufferUtils: true, pad: true });
      buffer = output;
    }

    fs.promises.writeFile(filepath, buffer, { signal: ac?.signal })
      .then(resolve, reject);
  });
}

export function writeBinarySync(
  filepath: fs.PathLike,
  contents: K,
  mask?: K // eslint-disable-line comma-dangle
): void {
  let buffer = chunkToBuffer(contents);

  if(mask) {
    const output = Buffer.alloc(buffer.length);

    maskBuffer(buffer, chunkToBuffer(mask), output, 0, buffer.length, { avoidBufferUtils: true, pad: true });
    buffer = output;
  }

  fs.writeFileSync(filepath, buffer);
}



export function createBinaryReadStream(
  filepath: fs.PathLike,
  mask?: K,
  offset?: number | null | undefined,
  length?: number | null | undefined,
  token?: ICancellationToken // eslint-disable-line comma-dangle
): fs.ReadStream {
  // log(`Starting streaming binary read: ${filepath}`);
  const ac = token ? new AbortController() : null;

  (token || CancellationToken.None).onCancellationRequested(() => {
    ac?.abort();
    // log(`Streaming binary read cancelled: ${filepath}`);
  });

  const stream = fs.createReadStream(filepath, {
    signal: ac?.signal,
    start: offset ?? 0,
    end: isNumber(length) ? (offset ?? 0) + length : void 0,
  });

  if(mask) {
    const transformStream = new Transform({
      transform(chunk, _, callback) {
        if(token && token.isCancellationRequested) return callback(new Error('Token cancelled'));

        try {
          unmaskBuffer(chunk, chunkToBuffer(mask), { avoidBufferUtils: true, pad: true });
          callback(null, chunk);
        } catch (err: any) {
          callback(err);
        }
      },
    });

    stream.pipe(transformStream);
  }

  return stream;
}


export async function writeBinaryStream(
  filepath: fs.PathLike,
  content: AsyncIterable<K> | Iterable<K>,
  mask?: K,
  token?: ICancellationToken // eslint-disable-line comma-dangle
): Promise<number> {
  // log(`Starting streaming binary write: ${filepath}`);

  return promises.withAsyncBody<number>(async (resolve, reject) => {
    const ac = token ? new AbortController() : null;

    (token || CancellationToken.None).onCancellationRequested(() => {
      ac?.abort();
      reject(new Exception('Streaming file write was cancelled by token', 'ERR_TOKEN_CANCELED'));
    });

    const stream = fs.createWriteStream(filepath, { signal: ac?.signal });
    let writtenBytes: number = 0;

    try {
      for await (const chunk of content) {
        let buffer = chunkToBuffer(chunk);

        if(mask) {
          const output = Buffer.alloc(buffer.length);
          maskBuffer(buffer, chunkToBuffer(mask), output, 0, buffer.length, { avoidBufferUtils: true, pad: true });

          buffer = output;
        }

        if(!stream.write(buffer)) {
          await new Promise<void>((resolve, reject) => {
            stream.once('drain', resolve);
            stream.once('error', reject);
          });
        }

        writtenBytes += buffer.byteLength;
      }
      
      stream.end();
    } catch (err: any) {
      reject(err);
    }

    stream.on('finish', () => {
      // log(`Completed streaming binary write: ${filepath}`);
      resolve(writtenBytes);
    });

    stream.on('error', err => {
      // log(`Error during streaming binary write: ${err.message}`);
      reject(err);
    });
  });
}
