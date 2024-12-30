import Int64 from './int64';
import { toString } from '../util';


describe('Int64 class tests', () => {
  test('should create an Int64 instance and correctly set the value', () => {
    const int64 = new Int64(42);
    expect(int64.value).toBe(42n);
  });

  test('should return correct signed value for Int64', () => {
    const int64 = new Int64(0x8000000000000000n); // A large unsigned number
    expect(int64.asSigned()).toBe(-9223372036854775808n);
  });

  test('should return correct unsigned value for Int64', () => {
    const int64 = new Int64(-1);
    expect(int64.asUnsigned()).toBe(18446744073709551615n);
  });

  test('should add two Int64 instances correctly', () => {
    const int64a = new Int64(5);
    const int64b = new Int64(3);
    const result = int64a.add(int64b);
    expect(result.value).toBe(8n);
  });

  test('should subtract two Int64 instances correctly', () => {
    const int64a = new Int64(10);
    const int64b = new Int64(4);
    const result = int64a.sub(int64b);
    expect(result.value).toBe(6n);
  });

  test('should multiply two Int64 instances correctly', () => {
    const int64a = new Int64(4);
    const int64b = new Int64(3);
    const result = int64a.mul(int64b);
    expect(result.value).toBe(12n);
  });

  test('should divide two Int64 instances correctly', () => {
    const int64a = new Int64(10);
    const int64b = new Int64(2);
    const result = int64a.div(int64b);
    expect(result.value).toBe(5n);
  });

  test('should throw an error for division by zero', () => {
    const int64a = new Int64(10);
    const int64b = new Int64(0);
    expect(() => int64a.div(int64b)).toThrowError('Division by zero');
  });

  test('should compute modulo correctly', () => {
    const int64a = new Int64(10);
    const int64b = new Int64(3);
    const result = int64a.mod(int64b);
    expect(result.value).toBe(1n);
  });

  test('should perform bitwise AND operation correctly', () => {
    const int64a = new Int64(5);  // 101
    const int64b = new Int64(3);  // 011
    const result = int64a.and(int64b);
    expect(result.value).toBe(1n); // 001
  });

  test('should perform bitwise OR operation correctly', () => {
    const int64a = new Int64(5);  // 101
    const int64b = new Int64(3);  // 011
    const result = int64a.or(int64b);
    expect(result.value).toBe(7n); // 111
  });

  test('should perform bitwise XOR operation correctly', () => {
    const int64a = new Int64(5);  // 101
    const int64b = new Int64(3);  // 011
    const result = int64a.xor(int64b);
    expect(result.value).toBe(6n); // 110
  });

  test('should perform bitwise NOT operation correctly', () => {
    const int64a = new Int64(5);  // 0000...0101
    const result = int64a.not();
    expect(result.value).toBe(-6n); // 1111...1010 (two's complement)
  });

  test('should shift left correctly', () => {
    const int64a = new Int64(5);  // 0000...0101
    const int64b = new Int64(1);  // Shift by 1
    const result = int64a.shl(int64b);
    expect(result.value).toBe(10n); // 0000...1010
  });

  test('should shift right correctly', () => {
    const int64a = new Int64(5);  // 0000...0101
    const int64b = new Int64(1);  // Shift by 1
    const result = int64a.shr(int64b);
    expect(result.value).toBe(2n); // 0000...0010
  });

  test('should compare equality correctly', () => {
    const int64a = new Int64(5);
    const int64b = new Int64(5);
    const int64c = new Int64(3);
    expect(int64a.eq(int64b)).toBe(true);
    expect(int64a.eq(int64c)).toBe(false);
  });

  test('should compare inequality correctly', () => {
    const int64a = new Int64(5);
    const int64b = new Int64(3);
    expect(int64a.ne(int64b)).toBe(true);
    expect(int64a.ne(int64a)).toBe(false);
  });

  test('should compare less than correctly', () => {
    const int64a = new Int64(3);
    const int64b = new Int64(5);
    expect(int64a.lt(int64b)).toBe(true);
    expect(int64b.lt(int64a)).toBe(false);
  });

  test('should compare less than or equal correctly', () => {
    const int64a = new Int64(5);
    const int64b = new Int64(5);
    const int64c = new Int64(3);
    expect(int64a.le(int64b)).toBe(true);
    expect(int64b.le(int64c)).toBe(false);
  });

  test('should compare greater than correctly', () => {
    const int64a = new Int64(5);
    const int64b = new Int64(3);
    expect(int64a.gt(int64b)).toBe(true);
    expect(int64b.gt(int64a)).toBe(false);
  });

  test('should compare greater than or equal correctly', () => {
    const int64a = new Int64(5);
    const int64b = new Int64(5);
    const int64c = new Int64(3);
    expect(int64a.ge(int64b)).toBe(true);
    expect(int64b.ge(int64c)).toBe(true);
    expect(int64c.ge(int64a)).toBe(false);
  });

  test('should correctly check if the number is zero', () => {
    const int64a = new Int64(0);
    const int64b = new Int64(5);
    expect(int64a.isZero()).toBe(true);
    expect(int64b.isZero()).toBe(false);
  });

  test('should correctly check if the number is negative', () => {
    const int64a = new Int64(-1);
    const int64b = new Int64(1);
    expect(int64a.isNegative()).toBe(true);
    expect(int64b.isNegative()).toBe(false);
  });

  test('should return the correct valueOf', () => {
    const int64 = new Int64(42);
    expect(int64.valueOf()).toBe(42n);
  });

  test('should return the correct string representation', () => {
    const int64 = new Int64(42);
    expect(int64.toString()).toBe('42');
    expect(int64.toString(16)).toBe('2a');
  });

  test('should return correct Symbol.toStringTag', () => {
    const int64 = new Int64(42);
    expect(toString(int64)).toBe('[object Int64]');
  });
});
