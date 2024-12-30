import { NumberHandler } from './core';


export class Int32 implements NumberHandler {
  readonly #value: number;

  public constructor(value: number) {
    this.#value = (value | 0) >>> 0;
  }

  /** Get the value of the number as an unsigned 32-bit integer. */
  public get value(): number {
    return this.#value;
  }

  /**
   * Convert the number to a signed 32-bit integer.
   * @returns { number } The signed 32-bit integer. 
   */
  public asSigned(): number {
    // Convert unsigned to signed if needed
    return this.value > 0x7FFFFFFF ? this.value - 0x100000000 : this.value;
  }

  /**
   * Convert the number to an unsigned 32-bit integer.
   * 
   * @returns { number } The unsigned 32-bit integer.
   */
  public asUnsigned(): number {
    return this.value;
  }

  /**
   * Add the value to the number.
   * 
   * @param { Int32 } value The value to add. 
   * @returns { Int32 } The result of the addition.
   */
  public add(value: Int32): Int32 {
    return new Int32(this.value + value.asUnsigned());
  }

  /**
   * Subtract the value from the number.
   * 
   * @param { Int32 } value The value to subtract.
   * @returns { Int32 } The result of the subtraction.
   */
  public sub(value: Int32): Int32 {
    return new Int32(this.value - value.asUnsigned());
  }

  /**
   * Multiply the number by the value.
   * 
   * @param { Int32 } value The value to multiply by.
   * @returns { Int32 } The result of the multiplication.
   */
  public mul(value: Int32): Int32 {
    return new Int32(this.value * value.asUnsigned());
  }

  /**
   * Divide the number by the value.
   * 
   * @param { Int32 } value The value to divide by.
   * @returns { Int32 } The result of the division.
   */
  public div(value: Int32): Int32 {
    if(value.eq(new Int32(0))) {
      throw new Error('Division by zero');
    }

    return new Int32(this.value / value.asUnsigned());
  }

  /**
   * Get the remainder of the number divided by the value.
   * 
   * @param { Int32 } value The value to divide by.
   * @returns { Int32 } The remainder of the division.
   */
  public mod(value: Int32): Int32 {
    return new Int32(this.value % value.asUnsigned());
  }

  /**
   * Perform a bitwise AND operation with the value.
   * 
   * @param { Int32 } value The value to AND with.
   * @returns { Int32 } The result of the AND operation.
   */
  public and(value: Int32): Int32 {
    return new Int32(this.value & value.asUnsigned());
  }

  /**
   * Perform a bitwise OR operation with the value.
   * 
   * @param { Int32 } value The value to OR with.
   * @returns { Int32 } The result of the OR operation.
   */
  public or(value: Int32): Int32 {
    return new Int32(this.value | value.asUnsigned());
  }

  /**
   * Perform a bitwise XOR operation with the value.
   * 
   * @param { Int32 } value The value to XOR with.
   * @returns { Int32 } The result of the XOR operation.
   */
  public xor(value: Int32): Int32 {
    return new Int32(this.value ^ value.asUnsigned());
  }

  /**
   * Perform a bitwise NOT operation on the number.
   * 
   * @returns { Int32 } The result of the NOT operation.
   */
  public not(): Int32 {
    return new Int32(~this.value);
  }

  /**
   * Perform a bitwise shift left operation on the number.
   * 
   * @param { Int32 } value The number of bits to shift.
   * @returns { Int32 } The result of the shift operation.
   */
  public shl(value: Int32): Int32 {
    return new Int32(this.value << value.asUnsigned());
  }

  /**
   * Perform a bitwise shift right operation on the number.
   * 
   * @param { Int32 } value The number of bits to shift.
   * @returns { Int32 } The result of the shift operation.
   */
  public shr(value: Int32): Int32 {
    return new Int32(this.value >>> value.asUnsigned());
  }

  /**
   * Compare the number to the value for equality.
   * 
   * @param { Int32 } value The value to compare. 
   * @returns { boolean } True if the numbers are equal, false otherwise.
   */
  public eq(value: Int32): boolean {
    return this.value === value.asUnsigned();
  }

  /**
   * Compare the number to the value for inequality.
   * 
   * @param { Int32 } value The value to compare.
   * @returns { boolean } True if the numbers are not equal, false otherwise.
   */
  public ne(value: Int32): boolean {
    return this.value !== value.asUnsigned();
  }

  /**
   * Compare the number to the value for less than.
   * 
   * @param { Int32 } value The value to compare.
   * @returns { boolean } True if the number is less than the value, false otherwise.
   */
  public lt(value: Int32): boolean {
    return this.value < value.asUnsigned();
  }

  /**
   * Compare the number to the value for less than or equal.
   * 
   * @param { Int32 } value The value to compare.
   * @returns { boolean } True if the number is less than or equal to the value, false otherwise.
   */
  public le(value: Int32): boolean {
    return this.value <= value.asUnsigned();
  }

  /**
   * Compare the number to the value for greater than.
   * 
   * @param { Int32 } value The value to compare.
   * @returns { boolean } True if the number is greater than the value, false otherwise.
   */
  public gt(value: Int32): boolean {
    return this.value > value.asUnsigned();
  }

  /**
   * Compare the number to the value for greater than or equal.
   * 
   * @param { Int32 } value The value to compare.
   * @returns { boolean } True if the number is greater than or equal to the value, false otherwise.
   */
  public ge(value: Int32): boolean {
    return this.value >= value.asUnsigned();
  }

  /**
   * Check if the number is zero.
   * 
   * @returns { boolean } True if the number is zero, false otherwise.
   */
  public isZero(): boolean {
    return this.value === 0;
  }

  /**
   * Check if the number is negative.
   * 
   * @returns { boolean } True if the number is negative, false otherwise.
   */
  public isNegative(): boolean {
    return this.asSigned() < 0;
  }

  /**
   * Get the value of the number.
   * 
   * @returns { number } The value of the number.
   */
  public valueOf(): number {
    return this.#value;
  }

  /**
   * Get the string representation of the number.
   * 
   * @param { number } radix The radix to use for the string conversion.
   * @returns { string } The string representation of the number.
   */
  public toString(radix?: number): string {
    return this.#value.toString(radix);
  }

  public [Symbol.toStringTag](): string {
    return '[object Int32]';
  }
}

export default Int32;
