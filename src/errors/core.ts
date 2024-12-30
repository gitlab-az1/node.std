import { assertNumeric } from '../asserts';
import StackTraceCollector from './stacktrace';
import type { LooseAutocomplete } from '../types';


enum ERROR_CODE {
  ERR_UNKNOWN_ERROR = 0x2,
  ERR_UNWRAP_NONE = 0x3,
  ERR_INVALID_ARGUMENT = 0x4,
  ERR_OUT_OF_BOUNDS = 0x5,
  ERR_INVALID_TYPE = 0x6,
  ERR_TOKEN_CANCELED = 0x7,
  ERR_TIMEOUT = 0x8,
}


const extendedCodes: Record<string, number> = {};
const $codeHolder = Symbol('ERROR::INTERNAL_DESCRIPTOR.Code');


export class ErrorCode {
  public static extend<K extends string>(codes: readonly K[]): void {
    const maxValue = Math.max(
      ...Object.values(ERROR_CODE).filter(item => typeof item === 'number'),
      ...Object.values(extendedCodes) // eslint-disable-line comma-dangle
    );

    let validCount = 0;

    for(let i = 0; i < codes.length; i++) {
      const currentCode = codes[i].toUpperCase().trim();

      if(
        !!ERROR_CODE[currentCode as keyof typeof ERROR_CODE] ||
        !!extendedCodes[currentCode]
      ) continue;

      const absCode = maxValue + validCount + 1;
      extendedCodes[currentCode] = absCode;
      validCount++;
    }
  }

  public static for(code: LooseAutocomplete<keyof typeof ERROR_CODE>): ErrorCode {
    let ncode = ERROR_CODE[code as keyof typeof ERROR_CODE] || extendedCodes[code as string] || ERROR_CODE.ERR_UNKNOWN_ERROR;

    if(typeof ncode !== 'number') {
      ncode = 0x2;
    }

    return new ErrorCode(ncode);
  }

  private readonly [$codeHolder]: number;

  private constructor(code: number) {
    assertNumeric(code);
    this[$codeHolder] = -Math.abs(code);
  }

  public getCode(): number {
    return this[$codeHolder];
  }

  public valueOf(): number {
    return this[$codeHolder];
  }
}


export type ExceptionOptions = {
  context?: any;
};

export class Exception extends Error {
  public override readonly name: string;
  public readonly errorCode: number;
  public readonly context?: any;
  readonly stackTrace: StackTraceCollector;
  
  public constructor(
    message: string,
    code: ErrorCode | LooseAutocomplete<keyof typeof ERROR_CODE>,
    options?: ExceptionOptions // eslint-disable-line comma-dangle
  ) {
    super(message);

    if(!(code instanceof ErrorCode)) {
      code = ErrorCode.for(code);
    }

    this.name = 'Exception';
    this.errorCode = code.getCode();
    this.context = options?.context;
    this.stackTrace = StackTraceCollector.create();
  }
}
