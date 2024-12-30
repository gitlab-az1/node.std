
/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 */
function _mask(source: Buffer, mask: Buffer, output: Buffer, offset: number, length: number, pad?: boolean): void {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[pad ? Math.floor(i % mask.length) : i & 3];
  }
}

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 */
function _unmask(buffer: Buffer, mask: Buffer, pad?: boolean): void {
  for(let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[pad ? Math.floor(i % mask.length) : i & 3];
  }
}


/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 */
export function mask(source: Buffer, mask: Buffer, output: Buffer, offset: number, length: number, options?: { avoidBufferUtils?: boolean; pad?: boolean }): void {
  options ??= {};

  if(typeof options.avoidBufferUtils !== 'boolean') {
    options.avoidBufferUtils = true;
  }

  if(process.env.NO_BUFFER_UTILS === '1' || options?.avoidBufferUtils) return _mask(source, mask, output, offset, length, options.pad);
  if(length < 48) return _mask(source, mask, output, offset, length, options.pad);

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bufferUtil = require('bufferutil');
    return bufferUtil.mask(source, mask, output, offset, length);

    // eslint-disable-next-line no-empty
  } catch {
    return _mask(source, mask, output, offset, length, options.pad);
  }
}


/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 */
export function unmask(buffer: Buffer, mask: Buffer, options?: { avoidBufferUtils?: boolean; pad?: boolean }): void {
  options ??= {};

  if(typeof options.avoidBufferUtils !== 'boolean') {
    options.avoidBufferUtils = true;
  }

  if(process.env.NO_BUFFER_UTILS === '1' || options?.avoidBufferUtils) return _unmask(buffer, mask, options.pad);
  if(buffer.length < 32) return _unmask(buffer, mask, options.pad);

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bufferUtil = require('bufferutil');
    return bufferUtil.unmask(buffer, mask);

    // eslint-disable-next-line no-empty
  } catch {
    return _unmask(buffer, mask, options.pad);
  }
}


/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 */
export const unsafeMask = _mask;

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 */
export const unsafeUnmask = _unmask;
