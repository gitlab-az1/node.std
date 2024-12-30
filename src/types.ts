
/**
 * **LooseAutocomplete** - A utility type for enabling autocomplete suggestions while allowing arbitrary string values.
 *
 * @template T - A type that extends `string`, `number`, or `symbol`.
 *
 * This type is primarily useful for scenarios where strict type enforcement is desired for predefined values,  
 * but flexibility is also required to support custom or dynamic values outside the predefined set.
 *
 * ### Example Usage:
 *
 * ```typescript
 * type Colors = 'red' | 'blue' | 'green';
 * const color: LooseAutocomplete<Colors> = 'red';       // Valid (predefined)
 * const customColor: LooseAutocomplete<Colors> = 'pink'; // Valid (custom string)
 * const invalidColor: LooseAutocomplete<Colors> = 42;   // Error (must be a string)
 * ```
 *
 * ### Behavior:
 * - Provides autocomplete suggestions for the values in `T`.
 * - Allows any string value, even if it's not listed in `T`.
 * - Restricts input to string-like types (no numbers or symbols unless explicitly included in `T`).
 */
export type LooseAutocomplete<T extends string | number | symbol> = T | Omit<string, T>;


/**
 * **NDArray** - Represents a multi-dimensional array type.
 *
 * @template T - The type of the elements stored in the array.
 * @template Dims - An array of numbers specifying the dimensions of the array.
 *
 * ### Example Usage:
 * ```typescript
 * type Matrix = NDArray<number, [2, 3]>; // 2x3 matrix of numbers
 * type Tensor3D = NDArray<string, [2, 3, 4]>; // 3D tensor with string values
 * ```
 *
 * ### Behavior:
 * - Recursively constructs nested arrays based on the specified dimensions.
 * - Handles multidimensional arrays efficiently with type safety.
 */
export type NDArray<T, Dims extends number[]> = Dims extends []
  ? T // Base case: no dimensions, return the type T
  : NDArray<T, Tail<Dims>>[]; // Recursive case for nested arrays

/**
 * **Tail** - Extracts all but the first element of a tuple or array type.
 *
 * @template T - An array type to process.
 *
 * ### Example Usage:
 * ```typescript
 * type Rest = Tail<[1, 2, 3]>; // [2, 3]
 * ```
 */
export type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

/**
 * **Writable** - Makes all properties of an object mutable (removes `readonly`).
 *
 * @template T - The target object type.
 *
 * ### Example Usage:
 * ```typescript
 * type ReadOnlyObject = { readonly a: number; readonly b: string };
 * type MutableObject = Writable<ReadOnlyObject>; // { a: number; b: string }
 * ```
 */
export type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

/**
 * **DeepWritable** - Recursively makes all properties of an object mutable.
 *
 * @template T - The target object type.
 *
 * ### Example Usage:
 * ```typescript
 * type DeepReadOnly = { readonly a: { readonly b: number } };
 * type DeepMutable = DeepWritable<DeepReadOnly>; // { a: { b: number } }
 * ```
 */
export type DeepWritable<T> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepWritable<T[K]> : T[K];
};

/**
 * **DeepReadonly** - Recursively makes all properties of an object readonly.
 *
 * @template T - The target object type.
 *
 * ### Example Usage:
 * ```typescript
 * type Mutable = { a: { b: number } };
 * type ReadOnly = DeepReadonly<Mutable>; // { readonly a: { readonly b: number } }
 * ```
 */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

/**
 * **MaybePromise** - Allows a value to be either a direct value or a Promise of that value.
 *
 * @template T - The type of the value.
 *
 * ### Example Usage:
 * ```typescript
 * async function fetchData(): MaybePromise<string> {
 *   return fetch('/api').then(res => res.text());
 * }
 * ```
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * **MaybeArray** - Allows a value to be either a single value or an array of values.
 *
 * @template T - The type of the value.
 *
 * ### Example Usage:
 * ```typescript
 * function process(items: MaybeArray<number>): void {
 *   const array = Array.isArray(items) ? items : [items];
 * }
 * ```
 */
export type MaybeArray<T> = T | T[];

/**
 * **ArrayValues** - Extracts the element type of an array.
 *
 * @template T - The array type.
 *
 * ### Example Usage:
 * ```typescript
 * type Element = ArrayValues<number[]>; // number
 * ```
 */
export type ArrayValues<T> = T extends Array<infer V> ? V : never;

/**
 * **ObjectValues** - Extracts the union of all values in an object.
 *
 * @template T - The object type.
 *
 * ### Example Usage:
 * ```typescript
 * type Values = ObjectValues<{ a: number; b: string }>; // number | string
 * ```
 */
export type ObjectValues<T extends object> = T[keyof T];

/**
 * **ObjectKeys** - Extracts the union of all keys in an object.
 *
 * @template T - The object type.
 *
 * ### Example Usage:
 * ```typescript
 * type Keys = ObjectKeys<{ a: number; b: string }>; // 'a' | 'b'
 * ```
 */
export type ObjectKeys<T extends object> = keyof T;

/**
 * **K** - A union type for various buffer-like and array buffer-related types.
 *
 * ### Example Usage:
 * ```typescript
 * function processBuffer(input: K): void {
 *   // Accepts different buffer-like inputs
 * }
 * ```
 */
export type K = 
  | Buffer
  | string
  | ArrayBuffer
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | SharedArrayBuffer
  | ArrayBufferView
  | DataView;

/**
 * **DeepPartial** - Recursively makes all properties of an object optional.
 *
 * @template T - The target object type.
 *
 * ### Example Usage:
 * ```typescript
 * type Config = { a: { b: number } };
 * type PartialConfig = DeepPartial<Config>; // { a?: { b?: number } }
 * ```
 */
export type DeepPartial<T> = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends Function ?
    T :
    T extends Array<infer InferredArrayMember> ?
      DeepPartialArray<InferredArrayMember> :
      T extends object ?
      DeepPartialObject<T> :
      T | undefined
);

interface DeepPartialArray<T> extends Array<DeepPartial<T>> { }

/**
 * **DeepPartialObject** - Helper type for recursively partial object types.
 *
 * @template T - The target object type.
 */
type DeepPartialObject<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};

/**
 * **MultidimensionalArray** - Represents a recursive type for multidimensional arrays.
 *
 * @template T - The type of the array elements.
 *
 * ### Example Usage:
 * ```typescript
 * type MultiArray = MultidimensionalArray<number>; // Can be nested arrays of numbers.
 * ```
 */
export type MultidimensionalArray<T = number> = (T | MultidimensionalArray<T>)[];


export { CancelablePromise, Thenable } from './async/promise';
