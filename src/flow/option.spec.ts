import { 
  none, 
  some, 
  isSome, 
  isNone, 
  optionalCatch, 
  optionalResolve, 
  unwrap, 
  unwrapOr, 
  unwrapExpect, 
  option, 
} from '../flow/option';

import { Exception } from '../errors/index';


describe('Option Utility Functions', () => {
  describe('none and some', () => {
    test('should create a None type', () => {
      expect(isNone(none)).toBe(true);
      expect(isSome(none)).toBe(false);
    });

    test('should create a Some type', () => {
      const value = 42;
      const someOption = some(value);

      expect(isSome(someOption)).toBe(true);
      expect(isNone(someOption)).toBe(false);
    });
  });

  describe('optionalCatch', () => {
    test('should return Some when function does not throw', () => {
      const result = optionalCatch(() => 42);
      expect(isSome(result)).toBe(true);
    });

    test('should return None when function throws', () => {
      const result = optionalCatch(() => { throw new Error(); });
      expect(isNone(result)).toBe(true);
    });
  });

  describe('optionalResolve', () => {
    test('should resolve to Some on success', async () => {
      const promise = Promise.resolve(42);
      const result = await optionalResolve(promise);
      expect(isSome(result)).toBe(true);
    });

    test('should resolve to None on failure', async () => {
      const promise = Promise.reject(new Error());
      const result = await optionalResolve(promise);
      expect(isNone(result)).toBe(true);
    });
  });

  describe('unwrap functions', () => {
    test('unwrap should return the value if Some', () => {
      const value = 42;
      expect(unwrap(some(value))).toBe(value);
    });

    test('unwrap should throw if None', () => {
      expect(() => unwrap(none)).toThrow(Exception);
    });

    test('unwrapOr should return value if Some', () => {
      const value = 42;
      expect(unwrapOr(some(value), 0)).toBe(value);
    });

    test('unwrapOr should return fallback if None', () => {
      expect(unwrapOr(none, 0)).toBe(0);
    });

    test('unwrapExpect should return value if Some', () => {
      const value = 42;
      expect(unwrapExpect(some(value))).toBe(value);
    });

    test('unwrapExpect should throw if None', () => {
      expect(() => unwrapExpect(none)).toThrow(Exception);
    });
  });

  describe('OptionDefined', () => {
    test('should create a Some if value is defined', () => {
      const opt = option(42);
      expect(opt.is_some()).toBe(true);
      expect(opt.is_none()).toBe(false);
    });

    test('should create a None if value is null or undefined', () => {
      const optNull = option(null);
      const optUndefined = option(undefined);

      expect(optNull.is_none()).toBe(true);
      expect(optUndefined.is_none()).toBe(true);
    });

    test('should unwrap the value if Some', () => {
      const opt = option(42);
      expect(opt.unwrap()).toBe(42);
    });

    test('should throw if unwrap is called on None', () => {
      const opt = option(null);
      expect(() => opt.unwrap()).toThrow(Exception);
    });

    test('should return fallback value if unwrap_or is called on None', () => {
      const opt = option<number>(null);
      expect(opt.unwrap_or(0)).toBe(0);
    });
  });

  describe('option factory function', () => {
    test('should create an OptionDefined with a defined value', () => {
      const opt = option(42);
      expect(opt.is_some()).toBe(true);
    });

    test('should create an OptionDefined with None if value is null', () => {
      const opt = option(null);
      expect(opt.is_none()).toBe(true);
    });

    test('should create an OptionDefined with None if value is undefined', () => {
      const opt = option(undefined);
      expect(opt.is_none()).toBe(true);
    });
  });
});
