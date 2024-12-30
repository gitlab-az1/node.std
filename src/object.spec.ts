import { objectKeys, merge, createEnum, exclude, isPlainObject } from './object';  // Replace './utils' with the actual file path


describe('Object Utility Functions', () => {
  describe('objectKeys', () => {
    test('should return keys of an object as a type-safe array', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keys = objectKeys(obj);
      expect(keys).toEqual(['a', 'b', 'c']);
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
    });

    test('should work with nested objects', () => {
      const obj = { nested: { x: 1, y: 2 }, a: 10 };
      const keys = objectKeys(obj);
      expect(keys).toEqual(['nested', 'a']);
    });
  });

  describe('merge', () => {
    test('should merge multiple objects correctly', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const obj3 = { d: 5 };
      
      const result = merge(obj1, obj2, obj3);
      expect(result).toEqual({ a: 1, b: 3, c: 4, d: 5 });
    });

    test('should not modify the source objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      merge(obj1, obj2);

      expect(obj1).toEqual({ a: 1 });
      expect(obj2).toEqual({ b: 2 });
    });
  });

  describe('createEnum', () => {
    test('should create a structured enum where values are identical to keys', () => {
      const myEnum = createEnum('A', 'B', 'C');
      expect(myEnum).toEqual({ A: 'A', B: 'B', C: 'C' });
      expect(Object.isFrozen(myEnum)).toBe(true);  // Check if the enum is frozen
    });

    test('should work with numeric enum values', () => {
      const numericEnum = createEnum(1, 2, 3);
      expect(numericEnum).toEqual({ 1: 1, 2: 2, 3: 3 });
    });
  });

  describe('exclude', () => {
    test('should exclude specified keys from an object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = exclude(obj, 'b');
      expect(result).toEqual({ a: 1, c: 3 });
      expect(result).not.toHaveProperty('b');
    });

    test('should not modify the original object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const originalObj = { ...obj };
      exclude(obj, 'b');
      expect(obj).toEqual(originalObj);
    });

    test('should return the same object if no keys are excluded', () => {
      const obj = { a: 1, b: 2 };
      const result = exclude(obj);
      expect(result).toEqual(obj);
    });
  });

  describe('isPlainObject', () => {
    test('should return true for plain objects', () => {
      const obj = { key: 'value' };
      expect(isPlainObject(obj)).toBe(true);
    });

    test('should return false for arrays', () => {
      const arr = [1, 2, 3];
      expect(isPlainObject(arr)).toBe(false);
    });

    test('should return false for null', () => {
      expect(isPlainObject(null)).toBe(false);
    });

    test('should return true for objects created via `Object.create(null)`', () => {
      const obj = Object.create(null);
      expect(isPlainObject(obj)).toBe(true);
    });

    test('should return false for objects with custom prototype', () => {
      const obj = Object.create({ customProto: true });
      expect(isPlainObject(obj)).toBe(false);
    });
  });
});

