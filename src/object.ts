import type { Writable } from './types';


/**
 * Type-safe alias for `Object.keys` returning the names of the enumerable string properties and methods of an object.
 * 
 * @param obj Object that contains the properties and methods. 
 * @returns {(keyof obj)[]} An array with all the keys existent in the object
 */
export const objectKeys = <T extends object>(obj: T): (keyof T)[] => Object.keys(obj) as any;


type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

type Merge<S1, S2> = Prettify<Omit<S1, keyof S2> & S2>;

// eslint-disable-next-line @typescript-eslint/ban-types
type MergeArrayOfObjects<T extends readonly object[], S1 = {}> = T extends [
  infer S2 extends object,
  ...infer Rest extends object[]
] ? MergeArrayOfObjects<Rest, Merge<S1, S2>> : S1;

/**
 * Copy the values of all of the enumerable own properties from one or more source objects to a new object.
 * 
 * @param sources The objects to merge 
 * @returns The merged object
 */
export function merge<T extends readonly object[]>(...sources: T): MergeArrayOfObjects<T> {
  return Object.assign({}, ...sources);
}


/**
 * A type representing an enumeration structure where each member's value is identical to its key.
 * This is useful for defining enums that can be safely iterated over and provide type safety.
 * 
 * @typeParam TMembers - The types of the enum members, which can be either `string` or `number`.
 */
export type StructuredEnum<TMembers extends string | number> = { readonly [key in TMembers]: key };

export type EnumMembers<T> = T extends StructuredEnum<infer InferredMembers> ? InferredMembers : never;


/**
 * Creates a structured enum where each key's value is the same as its key, providing a type-safe enum-like structure.
 * This function leverages TypeScript's types to ensure that only specified `string` or `number` members can be assigned.
 *
 * @param {...TMembers[]} members - The list of members for the enum.
 * @returns {StructuredEnum<TMembers>} An object with each member key pointing to itself as a value, frozen to prevent modifications.
 */
export function createEnum<TMembers extends string | number>(...members: TMembers[]): StructuredEnum<TMembers> {
  const obj = {} as Writable<StructuredEnum<TMembers>>;

  for(let i = 0; i < members.length; i++) {
    obj[members[i]] = members[i];
  }

  return Object.freeze(obj);
}

export function exclude<
  T extends Record<any, any>,
  K extends keyof T
>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  if(typeof obj !== 'object' || Array.isArray(obj)) return obj;

  const o = { ...obj };

  for(const key of keys) {
    if(!Object.prototype.hasOwnProperty.call(o, key)) continue;
    delete o[key];
  }

  return o;
}


const kindOf = (cache => (thing: any) => {
  const str = Object.prototype.toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));


export const kindOfTest = (type: string) => {
  type = type.toLowerCase();
  return (thing: any) => kindOf(thing) === type;
};



/**
 * Determine if a value is a plain Object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a plain Object, otherwise false
 */
export function isPlainObject<T extends Record<any, any> = Record<any, any>>(val: unknown): val is T {
  if(Array.isArray(val)) return false;
  if(kindOf(val) !== 'object' || typeof val !== 'object') return false;
  if(val === null) return false;

  const prototype = Object.getPrototypeOf(val);

  return (
    prototype === null ||
    prototype === Object.prototype ||
    Object.getPrototypeOf(prototype) === null
  ) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
}
