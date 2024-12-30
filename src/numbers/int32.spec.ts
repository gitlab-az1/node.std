import Int32 from './int32';
import { toString } from '../util';


describe('Int32 class tests', () => {
  test('should create an Int32 instance and correctly set the value', () => {
    const int32 = new Int32(42);
    expect(int32.value).toBe(42);
  });

  test('should return correct signed value for Int32', () => {
    const int32 = new Int32(0x80000000); // A large unsigned number
    expect(int32.asSigned()).toBe(-2147483648);
  });

  test('should return correct unsigned value for Int32', () => {
    const int32 = new Int32(-1);
    expect(int32.asUnsigned()).toBe(4294967295);
  });

  test('should add two Int32 instances correctly', () => {
    const int32a = new Int32(5);
    const int32b = new Int32(3);
    const result = int32a.add(int32b);
    expect(result.value).toBe(8);
  });

  test('should subtract two Int32 instances correctly', () => {
    const int32a = new Int32(10);
    const int32b = new Int32(4);
    const result = int32a.sub(int32b);
    expect(result.value).toBe(6);
  });

  test('should multiply two Int32 instances correctly', () => {
    const int32a = new Int32(4);
    const int32b = new Int32(3);
    const result = int32a.mul(int32b);
    expect(result.value).toBe(12);
  });

  test('should divide two Int32 instances correctly', () => {
    const int32a = new Int32(10);
    const int32b = new Int32(2);
    const result = int32a.div(int32b);
    expect(result.value).toBe(5);
  });

  test('should throw an error for division by zero', () => {
    const int32a = new Int32(10);
    const int32b = new Int32(0);
    expect(() => int32a.div(int32b)).toThrowError('Division by zero');
  });

  test('should compute modulo correctly', () => {
    const int32a = new Int32(10);
    const int32b = new Int32(3);
    const result = int32a.mod(int32b);
    expect(result.value).toBe(1);
  });

  test('should perform bitwise AND operation correctly', () => {
    const int32a = new Int32(5);  // 101
    const int32b = new Int32(3);  // 011
    const result = int32a.and(int32b);
    expect(result.value).toBe(1); // 001
  });

  test('should perform bitwise OR operation correctly', () => {
    const int32a = new Int32(5);  // 101
    const int32b = new Int32(3);  // 011
    const result = int32a.or(int32b);
    expect(result.value).toBe(7); // 111
  });

  test('should perform bitwise XOR operation correctly', () => {
    const int32a = new Int32(5);  // 101
    const int32b = new Int32(3);  // 011
    const result = int32a.xor(int32b);
    expect(result.value).toBe(6); // 110
  });

  test('should perform bitwise NOT operation correctly', () => {
    const int32a = new Int32(5);  // 0000...0101
    const result = int32a.not();
    expect(result.value).toBe(4294967290); // 1111...1010
  });

  test('should shift left correctly', () => {
    const int32a = new Int32(5);  // 0000...0101
    const int32b = new Int32(1);  // Shift by 1
    const result = int32a.shl(int32b);
    expect(result.value).toBe(10); // 0000...1010
  });

  test('should shift right correctly', () => {
    const int32a = new Int32(5);  // 0000...0101
    const int32b = new Int32(1);  // Shift by 1
    const result = int32a.shr(int32b);
    expect(result.value).toBe(2); // 0000...0010
  });

  test('should compare equality correctly', () => {
    const int32a = new Int32(5);
    const int32b = new Int32(5);
    const int32c = new Int32(3);
    expect(int32a.eq(int32b)).toBe(true);
    expect(int32a.eq(int32c)).toBe(false);
  });

  test('should compare inequality correctly', () => {
    const int32a = new Int32(5);
    const int32b = new Int32(3);
    expect(int32a.ne(int32b)).toBe(true);
    expect(int32a.ne(int32a)).toBe(false);
  });

  test('should compare less than correctly', () => {
    const int32a = new Int32(3);
    const int32b = new Int32(5);
    expect(int32a.lt(int32b)).toBe(true);
    expect(int32b.lt(int32a)).toBe(false);
  });

  test('should compare less than or equal correctly', () => {
    const int32a = new Int32(5);
    const int32b = new Int32(5);
    const int32c = new Int32(3);
    expect(int32a.le(int32b)).toBe(true);
    expect(int32b.le(int32c)).toBe(false);
  });

  test('should compare greater than correctly', () => {
    const int32a = new Int32(5);
    const int32b = new Int32(3);
    expect(int32a.gt(int32b)).toBe(true);
    expect(int32b.gt(int32a)).toBe(false);
  });

  test('should compare greater than or equal correctly', () => {
    const int32a = new Int32(5);
    const int32b = new Int32(5);
    const int32c = new Int32(3);
    expect(int32a.ge(int32b)).toBe(true);
    expect(int32b.ge(int32c)).toBe(true);
    expect(int32c.ge(int32a)).toBe(false);
  });

  test('should correctly check if the number is zero', () => {
    const int32a = new Int32(0);
    const int32b = new Int32(5);
    expect(int32a.isZero()).toBe(true);
    expect(int32b.isZero()).toBe(false);
  });

  test('should correctly check if the number is negative', () => {
    const int32a = new Int32(-1);
    const int32b = new Int32(1);
    expect(int32a.isNegative()).toBe(true);
    expect(int32b.isNegative()).toBe(false);
  });

  test('should return the correct valueOf', () => {
    const int32 = new Int32(42);
    expect(int32.valueOf()).toBe(42);
  });

  test('should return the correct string representation', () => {
    const int32 = new Int32(42);
    expect(int32.toString()).toBe('42');
    expect(int32.toString(16)).toBe('2a');
  });

  test('should return correct Symbol.toStringTag', () => {
    const int32 = new Int32(42);
    expect(toString(int32)).toBe('[object Int32]');
  });
});
