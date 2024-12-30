import { Exception } from '../errors/index';


// Enum to represent the type of an Option (None or Some)
const enum OptionType {
  None,
  Some,
}

const $type = Symbol('OPTION::INTERNAL_DESCRIPTIOR.Type');
const $value = Symbol('OPTION::INTERNAL_DESCRIPTIOR.Value');


export type None = { [$type]: OptionType.None };
export type Some<T> = { [$type]: OptionType.Some; [$value]: T };
export type Option<T> = None | Some<T>;


/** Function to check if an Option is Some (contains a value) */
export function isSome<T>(option: Option<T>): option is Some<T> {
  return option[$type] === OptionType.Some;
}

/** Function to check if an Option is None (no value) */
export function isNone<T>(option: Option<T>): option is None {
  return option[$type] === OptionType.None;
}

/** Predefined singleton representing None */
export const none: None = Object.freeze({ [$type]: OptionType.None });

/** Factory function to create a Some instance with a value */
export const some = <T>(value: T) => ({ [$value]: value, [$type]: OptionType.Some });

/**
 * Wraps a function call in a try-catch block.
 * Returns Some if the function executes without throwing, otherwise returns None.
 */
export function optionalCatch<T>(fn: () => T): Option<T> {
  try {
    return some(fn());
  } catch {
    return none;
  }
}

/**
 * Wraps a promise in a try-catch block.
 * Resolves to Some if the promise resolves successfully, otherwise resolves to None.
 */
export async function optionalResolve<T>(p: Promise<T>): Promise<Option<T>> {
  try {
    return some(await p);
  } catch {
    return none;
  }
}

/**
 * Converts a type-checking function into an Option-returning function.
 * Returns Some if the input satisfies the condition, otherwise returns None.
 */
export function toOptional<I, O extends I>(fn: (input: I) => input is O): ((arg: I) => Option<O>) {
  return function(arg: I): Option<O> {
    try {
      return fn(arg) ? some(arg) : none;
    } catch {
      return none;
    }
  };
}

/** Predefined optional function to check if a value is defined (non-null and non-undefined) */
export const optionalDefined = toOptional( <T>(arg: T | null | undefined): arg is T => !!arg );

/** Predefined optional function to check if a value is a Buffer */
export const optionalBuffer = toOptional( (arg: Uint8Array | null | undefined): arg is Buffer => !!arg && Buffer.isBuffer(arg) );

/**
 * Unwraps an Option, returning its value if Some.
 * Throws an exception if the Option is None.
 */
export function unwrap<T>(option: Option<T>): T {
  if(option[$type] === OptionType.Some) return option[$value];
  throw new Exception('Cannot unwrap a None value', 'ERR_UNWRAP_NONE');
}

/**
 * Unwraps an Option, returning its value if Some.
 * Returns a fallback value if the Option is None.
 */
export function unwrapOr<T>(option: Option<T>, fallback: T): T {
  if(option[$type] === OptionType.Some) return option[$value];
  return fallback;
}

/**
 * Unwraps an Option, returning its value if Some.
 * Throws an exception with a custom message if the Option is None.
 */
export function unwrapExpect<T>(option: Option<T>, message?: string): T {
  if(option[$type] !== OptionType.Some) {
    throw new Exception(message || 'Cannot unwrap a None value', 'ERR_UNWRAP_NONE');
  }

  return option[$value];
}

/**
 * Abstract class to provide a structured implementation for handling Option values.
 * Provides utility methods to check and unwrap Option values.
 */
export abstract class OptionBody<T, TSome extends T> {
  readonly #option: Option<TSome>; // Internal storage for the Option value

  /**
   * Constructor initializes the Option based on a type-checker function.
   * @param checker - Function to validate if value satisfies the type requirement.
   * @param value - Value to check and wrap into an Option.
   */
  public constructor(
    checker: (value: T) => value is TSome,
    value: T // eslint-disable-line comma-dangle
  ) {
    this.#option = toOptional(checker)(value);
  }

  /** Returns true if the Option is Some */
  public is_some(): this is Some<TSome> {
    return isSome(this.#option);
  }
  
  /** Returns true if the Option is None */
  public is_none(): this is None {
    return isNone(this.#option);
  }

  /** Unwraps and returns the value if Some, throws an error if None */
  public unwrap(): TSome {
    return unwrap(this.#option);
  }

  /** Unwraps and returns the value if Some, returns a fallback if None */
  public unwrap_or(fallback: TSome): TSome {
    return unwrapOr(this.#option, fallback);
  }

  /** Unwraps and returns the value if Some, throws a custom error if None */
  public unwrap_expect(): TSome {
    return unwrapExpect(this.#option);
  }
}

/**
 * Class to represent a defined value wrapped in an Option.
 * Provides utility methods inherited from OptionBody.
 */
class OptionDefined<T> extends OptionBody<T, T> {
  /**
   * Constructor initializes the OptionDefined with the provided value.
   * Treats null or undefined as None.
   * @param value - Value to wrap into an Option.
   */
  public constructor(value: T | null | undefined) {
    super(((arg: any) => !!arg) as any, value as any);
  }
}

/**
 * Factory function to create an OptionDefined instance.
 * Treats null or undefined as None, and other values as Some.
 */
export function option<T>(value: T | null | undefined): OptionDefined<T> {
  return new OptionDefined(value);
}
