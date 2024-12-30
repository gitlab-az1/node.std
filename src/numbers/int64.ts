import { BigNumberHandler } from './core';


export class Int64 implements BigNumberHandler {
  readonly #value: bigint;

  public constructor(value: bigint | number) {
    this.#value = BigInt(value);
  }

  /** Get the value of the number as a 64-bit integer. */
  public get value(): bigint {
    return this.#value;
  }

  /**
   * Convert the number to a signed 64-bit integer.
   * @returns { bigint } The signed 64-bit integer.
   */
  public asSigned(): bigint {
    const mask = BigInt(1) << BigInt(63);
    return this.#value & mask ? this.#value - (BigInt(1) << BigInt(64)) : this.#value;
  }

  /**
   * Convert the number to an unsigned 64-bit integer.
   * @returns { bigint } The unsigned 64-bit integer.
   */
  public asUnsigned(): bigint {
    return this.#value & ((BigInt(1) << BigInt(64)) - BigInt(1));
  }

  public add(value: Int64): Int64 {
    return new Int64(this.#value + value.value);
  }

  public sub(value: Int64): Int64 {
    return new Int64(this.#value - value.value);
  }

  public mul(value: Int64): Int64 {
    return new Int64(this.#value * value.value);
  }

  public div(value: Int64): Int64 {
    if (value.eq(new Int64(0))) {
      throw new Error('Division by zero');
    }
    return new Int64(this.#value / value.value);
  }

  public mod(value: Int64): Int64 {
    return new Int64(this.#value % value.value);
  }

  public and(value: Int64): Int64 {
    return new Int64(this.#value & value.value);
  }

  public or(value: Int64): Int64 {
    return new Int64(this.#value | value.value);
  }

  public xor(value: Int64): Int64 {
    return new Int64(this.#value ^ value.value);
  }

  public not(): Int64 {
    return new Int64(~this.#value);
  }

  public shl(value: Int64): Int64 {
    return new Int64(this.#value << value.value);
  }

  public shr(value: Int64): Int64 {
    return new Int64(this.#value >> value.value);
  }

  public eq(value: Int64): boolean {
    return this.#value === value.value;
  }

  public ne(value: Int64): boolean {
    return this.#value !== value.value;
  }

  public lt(value: Int64): boolean {
    return this.#value < value.value;
  }

  public le(value: Int64): boolean {
    return this.#value <= value.value;
  }

  public gt(value: Int64): boolean {
    return this.#value > value.value;
  }

  public ge(value: Int64): boolean {
    return this.#value >= value.value;
  }

  public isZero(): boolean {
    return this.#value === BigInt(0);
  }

  public isNegative(): boolean {
    return this.asSigned() < BigInt(0);
  }

  public valueOf(): bigint {
    return this.#value;
  }

  public toString(radix?: number): string {
    return this.#value.toString(radix);
  }

  public [Symbol.toStringTag](): string {
    return '[object Int64]';
  }
}

export default Int64;
