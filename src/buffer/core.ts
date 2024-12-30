import { Exception } from '../errors';


export function chunkToBuffer(chunk: any): Buffer {
  if(Buffer.isBuffer(chunk)) return chunk;
  if(typeof chunk === 'string') return Buffer.from(chunk);
  if(chunk instanceof ArrayBuffer) return Buffer.from(chunk);
  if(chunk instanceof Uint8Array) return Buffer.from(chunk);
  if(chunk instanceof Uint16Array) return Buffer.from(chunk);
  if(chunk instanceof Uint32Array) return Buffer.from(chunk);
  if(chunk instanceof Int8Array) return Buffer.from(chunk);
  if(chunk instanceof Int16Array) return Buffer.from(chunk);
  if(chunk instanceof Int32Array) return Buffer.from(chunk);
  if(chunk instanceof Float32Array) return Buffer.from(chunk);
  if(chunk instanceof Float64Array) return Buffer.from(chunk);
  if(chunk instanceof SharedArrayBuffer) return Buffer.from(chunk);
  if(chunk instanceof DataView) return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  if(ArrayBuffer.isView(chunk)) return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);

  throw new Exception('Received non-buffer chunk', 'ERR_INVALID_TYPE');
}
