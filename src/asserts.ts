export class AssertionError extends Error {
  public constructor(
    public readonly message: string,
    public readonly actual: unknown,
    public readonly expected: unknown,
    public readonly operator: string) {
    super(message);
  }
}


export function assertNumeric(value: unknown): asserts value is number {
  if(typeof value !== 'number') {
    throw new AssertionError('The received value is not a number', value, 'typeof number', '==');
  }
}

export function assertInteger(value: unknown): asserts value is number {
  assertNumeric(value);

  if(!Number.isInteger(value)) {
    throw new AssertionError('The current value is not a integer number', value, 'typeof int', '@<');
  }
}

export function assertFloat(value: unknown): asserts value is number {
  assertNumeric(value);

  if(Number.isInteger(value)) {
    throw new AssertionError('The current value is not a decimal number', value, 'typeof float', '@<');
  }
}

export function assertUnsignedInteger(value: unknown): asserts value is number {
  assertNumeric(value);

  if(!Number.isInteger(value) || value < 0) {
    throw new AssertionError('The current value is not a unsigned integer', value, 'uint', '@<');
  }
}

export function assertString(value: unknown): asserts value is string {
  if(typeof value !== 'string') {
    throw new AssertionError('The current value is not a string', value, 'typeof string', '@<');
  }
}

export function assertBoolean(value: unknown): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new AssertionError('The received value is not a boolean', value, 'typeof boolean', '==');
  }
}

export function assertObject(value: unknown): asserts value is object {
  if (typeof value !== 'object' || value === null) {
    throw new AssertionError('The received value is not an object', value, 'typeof object', '==');
  }
}

export function assertArray(value: unknown): asserts value is any[] {
  if (!Array.isArray(value)) {
    throw new AssertionError('The received value is not an array', value, 'Array.isArray', '==');
  }
}

export function assertFunction(value: unknown): asserts value is (...args: any[]) => unknown {
  if (typeof value !== 'function') {
    throw new AssertionError('The received value is not a function', value, 'typeof function', '==');
  }
}

export function assertNonEmptyString(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AssertionError(
      'The current value is not a non-empty string',
      value,
      'typeof non-empty string',
      '!==' );
  }
}


export function assertNonNull(value: unknown): asserts value is NonNullable<unknown> {
  if (value === null || value === undefined) {
    throw new AssertionError('The received value is null or undefined', value, 'non-nullable', '!==');
  }
}

