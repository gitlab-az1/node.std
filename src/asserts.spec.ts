import {
  AssertionError,
  assertNumeric,
  assertInteger,
  assertFloat,
  assertUnsignedInteger,
  assertString,
  assertBoolean,
  assertObject,
  assertArray,
  assertFunction,
  assertNonEmptyString,
  assertNonNull,
} from './asserts';


describe('Assertions Utility Functions', () => {
  describe('assertNumeric', () => {
    test('should pass for numeric values', () => {
      expect(() => assertNumeric(42)).not.toThrow();
      expect(() => assertNumeric(3.14)).not.toThrow();
    });

    test('should throw for non-numeric values', () => {
      expect(() => assertNumeric('42')).toThrow(AssertionError);
      expect(() => assertNumeric(null)).toThrow(AssertionError);
    });
  });

  describe('assertInteger', () => {
    test('should pass for integer values', () => {
      expect(() => assertInteger(42)).not.toThrow();
    });

    test('should throw for non-integer values', () => {
      expect(() => assertInteger(3.14)).toThrow(AssertionError);
      expect(() => assertInteger('42')).toThrow(AssertionError);
    });
  });

  describe('assertFloat', () => {
    test('should pass for float values', () => {
      expect(() => assertFloat(3.14)).not.toThrow();
    });

    test('should throw for non-float values', () => {
      expect(() => assertFloat(42)).toThrow(AssertionError);
      expect(() => assertFloat('3.14')).toThrow(AssertionError);
    });
  });

  describe('assertUnsignedInteger', () => {
    test('should pass for unsigned integer values', () => {
      expect(() => assertUnsignedInteger(42)).not.toThrow();
    });

    test('should throw for negative or non-integer values', () => {
      expect(() => assertUnsignedInteger(-1)).toThrow(AssertionError);
      expect(() => assertUnsignedInteger(3.14)).toThrow(AssertionError);
    });
  });

  describe('assertString', () => {
    test('should pass for valid strings', () => {
      expect(() => assertString('Hello')).not.toThrow();
      expect(() => assertString('')).not.toThrow(); // Allows empty strings
    });
  
    test('should throw for non-string values', () => {
      expect(() => assertString(42)).toThrow(AssertionError);
      expect(() => assertString(null)).toThrow(AssertionError);
      expect(() => assertString(undefined)).toThrow(AssertionError);
    });
  });
  

  describe('assertBoolean', () => {
    test('should pass for boolean values', () => {
      expect(() => assertBoolean(true)).not.toThrow();
      expect(() => assertBoolean(false)).not.toThrow();
    });

    test('should throw for non-boolean values', () => {
      expect(() => assertBoolean(1)).toThrow(AssertionError);
      expect(() => assertBoolean(null)).toThrow(AssertionError);
    });
  });

  describe('assertObject', () => {
    test('should pass for valid objects', () => {
      expect(() => assertObject({ key: 'value' })).not.toThrow();
    });

    test('should throw for non-object values', () => {
      expect(() => assertObject(null)).toThrow(AssertionError);
      expect(() => assertObject(42)).toThrow(AssertionError);
    });
  });

  describe('assertArray', () => {
    test('should pass for arrays', () => {
      expect(() => assertArray([1, 2, 3])).not.toThrow();
    });

    test('should throw for non-array values', () => {
      expect(() => assertArray('not an array')).toThrow(AssertionError);
      expect(() => assertArray(42)).toThrow(AssertionError);
    });
  });

  describe('assertFunction', () => {
    test('should pass for function values', () => {
      expect(() => assertFunction(() => {})).not.toThrow();
    });

    test('should throw for non-function values', () => {
      expect(() => assertFunction(42)).toThrow(AssertionError);
      expect(() => assertFunction('not a function')).toThrow(AssertionError);
    });
  });

  describe('assertNonEmptyString', () => {
    test('should pass for non-empty strings', () => {
      expect(() => assertNonEmptyString('Hello')).not.toThrow();
    });
  
    test('should throw for empty or non-string values', () => {
      expect(() => assertNonEmptyString('')).toThrow(AssertionError);
      expect(() => assertNonEmptyString(42)).toThrow(AssertionError);
      expect(() => assertNonEmptyString(null)).toThrow(AssertionError);
    });
  });  

  describe('assertNonNull', () => {
    test('should pass for non-null values', () => {
      expect(() => assertNonNull(42)).not.toThrow();
      expect(() => assertNonNull('Hello')).not.toThrow();
    });

    test('should throw for null or undefined values', () => {
      expect(() => assertNonNull(null)).toThrow(AssertionError);
      expect(() => assertNonNull(undefined)).toThrow(AssertionError);
    });
  });
});
