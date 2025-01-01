import { Exception } from '../errors';


const $state = Symbol('TYPED_NUMERIC::INTERNAL_DESCRIPTOR.State');


export type NumericType = 'int' | 'float';

export interface INumericObject {
  readonly type: NumericType;
  readonly signed: boolean;
  readonly value: number | bigint;
  readonly bignumber: boolean;

  validate(arg: unknown): boolean;
  eq(other: unknown): boolean;
  lt(other: unknown): boolean;
  le(other: unknown): boolean;
  gt(other: unknown): boolean;
  ge(other: unknown): boolean;
  add(other: unknown): INumericObject;
  sub(other: unknown): INumericObject;
  mul(other: unknown): INumericObject;
  div(other: unknown): INumericObject;
  mod(other: unknown): INumericObject;
  or(other: unknown): INumericObject;
  and(other: unknown): INumericObject;
  xor(other: unknown): INumericObject;
  not(): INumericObject;
  toUnsigned(): INumericObject;
  valueOf(): number | bigint;
}


abstract class NumericObject implements INumericObject {
  public abstract readonly type: NumericType;
  public abstract readonly signed: boolean;
  public abstract readonly value: number | bigint;
  public abstract readonly bignumber: boolean;

  public abstract validate(arg: unknown): boolean;

  public eq(other: NumericObject | number | bigint): boolean {
    const otherValue = other instanceof NumericObject ? other.value : other;
    
    if(!canCompare(this, other)) {
      throw new Exception(`Cannot compare a number with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return this.value === otherValue;
  }

  public lt(other: NumericObject | number | bigint): boolean {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot compare a number with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return this.value < otherValue;
  }

  public le(other: NumericObject | number | bigint): boolean {
    return this.lt(other) || this.eq(other);
  }

  public gt(other: NumericObject | number | bigint): boolean {    
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot compare a number with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }
    
    return this.value > otherValue;
  }

  public ge(other: NumericObject | number | bigint): boolean {
    return this.gt(other) || this.eq(other);
  }

  public abstract add(other: NumericObject | number | bigint): NumericObject;
  public abstract sub(other: NumericObject | number | bigint): NumericObject;
  public abstract mul(other: NumericObject | number | bigint): NumericObject;
  public abstract div(other: NumericObject | number | bigint): NumericObject;
  public abstract mod(other: NumericObject | number | bigint): NumericObject;
  public abstract or(other: NumericObject | number | bigint): NumericObject;
  public abstract and(other: NumericObject | number | bigint): NumericObject;
  public abstract xor(other: NumericObject | number | bigint): NumericObject;
  public abstract not(): NumericObject;
  public abstract toUnsigned(): NumericObject;

  public valueOf(): number | bigint {
    return this.value;
  }

  public [Symbol.toStringTag](): string {
    return '[object NumericObject]';
  }
}


type NumberState = {
  readonly type: NumericType;
  readonly signed: boolean;
  value: number;
};

export class Integer extends NumericObject {
  private [$state]: NumberState;

  public constructor(value: number, signed: boolean = false) {
    super();

    this[$state] = {
      type: 'int',
      value,
      signed,
    };

    if(!this.validate(value)) {
      throw new Exception(`Cannot create a integer value with 'typeof ${typeof value}' ->> ${value}`, 'ERR_INVALID_TYPE');
    }
  }

  public get type(): NumericType {
    return this[$state].type;
  }

  public get signed(): boolean {
    return this[$state].signed;
  }

  public get value(): number {
    return this[$state].value;
  }

  public get bignumber(): boolean {
    return false;
  }

  public validate(arg: unknown): arg is number {
    if(typeof arg !== 'number') return false;
    if(!Number.isInteger(arg)) return false;

    return this[$state].signed ? true : arg >= 0;
  }

  public add(other: NumericObject | number): Integer {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot add a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new Integer(Math.round(this[$state].value + (otherValue as number)), this[$state].signed);
  }

  public sub(other: NumericObject | number): Integer {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot subtract a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new Integer(Math.round(this[$state].value - (otherValue as number)), this[$state].signed);
  }

  public mul(other: NumericObject | number): Integer {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot multiply a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new Integer(Math.round(this[$state].value * (otherValue as number)), this[$state].signed);
  }

  public div(other: NumericObject | number): Integer {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot divide a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    if(otherValue === 0) {
      throw new Exception('Cannot divide a number by zero', 'ERR_DIVISION_BY_ZERO');
    }

    return new Integer(Math.round(this[$state].value / (otherValue as number)), this[$state].signed);
  }

  public mod(other: NumericObject | number): Integer {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot operate 'module' of a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    if(otherValue === 0) {
      throw new Exception('Cannot \'module\' of a number with zero', 'ERR_DIVISION_BY_ZERO');
    }

    return new Integer(this[$state].value % (otherValue as number), this[$state].signed);
  }

  public and(other: NumericObject | number): Integer {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot operate 'and' of a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new Integer(this[$state].value & (otherValue as number), this[$state].signed);
  }

  public or(other: NumericObject | number): Integer {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot operate 'or' of a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new Integer(this[$state].value | (otherValue as number), this[$state].signed);
  }

  public xor(other: NumericObject | number): Integer {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot operate 'xor' of a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new Integer(this[$state].value ^ (otherValue as number), this[$state].signed);
  }

  public not(): Integer {
    return new Integer(~this[$state].value, this.signed);
  }

  public toUnsigned(): UnsignedInteger {
    if(this.value < 0) {
      throw new Exception('Cannot convert negative integer to unsigned', 'ERR_UNSUPPORTED_OPERATION');
    }
    
    return new UnsignedInteger(this.value);
  }
}

export class UnsignedInteger extends Integer {
  public constructor(value: number) {
    if(value < 0) {
      throw new Exception('Unsigned integers cannot be negative', 'ERR_INVALID_ARGUMENT');
    }

    super(value, false);
  }

  public override toUnsigned(): UnsignedInteger {
    return this;
  }
}

export class BigInteger extends NumericObject {
  private [$state]: {
    readonly type: NumericType;
    readonly signed: boolean;
    value: bigint;
  };

  public constructor(value: bigint, signed: boolean = false) {
    super();

    this[$state] = {
      type: 'int',
      value,
      signed,
    };
  }

  public get type(): NumericType {
    return this[$state].type;
  }

  public get signed(): boolean {
    return this[$state].signed;
  }

  public get value(): bigint {
    return this[$state].value;
  }

  public get bignumber(): boolean {
    return true;
  }

  public validate(arg: unknown): arg is bigint {
    if(typeof arg !== 'bigint') return false;
    return this[$state].signed ? true : arg >= BigInt(0);
  }

  public add(other: NumericObject | number): BigInteger {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot add a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new BigInteger(this[$state].value + (otherValue as bigint), this[$state].signed);
  }

  public sub(other: NumericObject | number): BigInteger {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot subtract a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new BigInteger(this[$state].value - (otherValue as bigint), this[$state].signed);
  }

  public mul(other: NumericObject | number): BigInteger {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot multiply a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new BigInteger(this[$state].value * (otherValue as bigint), this[$state].signed);
  }

  public div(other: NumericObject | number): BigInteger {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot divide a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    if(otherValue === BigInt(0)) {
      throw new Exception('Cannot divide a number by zero', 'ERR_DIVISION_BY_ZERO');
    }

    return new BigInteger(this[$state].value / (otherValue as bigint), this[$state].signed);
  }

  public mod(other: NumericObject | number): BigInteger {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot operate 'module' of a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    if(otherValue === BigInt(0)) {
      throw new Exception('Cannot \'module\' of a number with zero', 'ERR_DIVISION_BY_ZERO');
    }

    return new BigInteger(this[$state].value % (otherValue as bigint), this[$state].signed);
  }

  public and(other: NumericObject | number): BigInteger {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot operate 'and' of a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new BigInteger(this[$state].value & (otherValue as bigint), this[$state].signed);
  }

  public or(other: NumericObject | number): BigInteger {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot operate 'or' of a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new BigInteger(this[$state].value | (otherValue as bigint), this[$state].signed);
  }

  public xor(other: NumericObject | number): BigInteger {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot operate 'xor' of a integer with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new BigInteger(this[$state].value ^ (otherValue as bigint), this[$state].signed);
  }

  public not(): BigInteger {
    return new BigInteger(~this[$state].value, this.signed);
  }

  public toUnsigned(): BigInteger {
    if(this.value < 0) {
      throw new Exception('Cannot convert negative integer to unsigned', 'ERR_UNSUPPORTED_OPERATION');
    }
    
    return new BigInteger(this.value, false);
  }
}

export class FloatPoint extends NumericObject {
  private [$state]: NumberState;

  public constructor(value: number, signed: boolean = true) {
    super();

    if(!Number.isFinite(value)) {
      throw new Exception('Float point values must be finite', 'ERR_INVALID_ARGUMENT');
    }

    if(Number.isInteger(value)) {
      value = value * 1.0;
    }

    this[$state] = {
      type: 'float',
      signed,
      value,
    };
  }

  public get type(): NumericType {
    return this[$state].type;
  }

  public get signed(): boolean {
    return this[$state].signed;
  }

  public get value(): number {
    return this[$state].value;
  }

  public get bignumber(): boolean {
    return false;
  }

  public validate(arg: unknown): arg is number {
    return typeof arg === 'number' && Number.isFinite(arg) && !Number.isInteger(arg);
  }

  public add(other: NumericObject | number): FloatPoint {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot add a float with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new FloatPoint(this.value + (otherValue as number));
  }

  public sub(other: NumericObject | number): FloatPoint {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot subtract a float with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new FloatPoint(this.value - (otherValue as number));
  }

  public mul(other: NumericObject | number): FloatPoint {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot multiply a float with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    return new FloatPoint(this.value * (otherValue as number));
  }

  public div(other: NumericObject | number): FloatPoint {
    const otherValue = other instanceof NumericObject ? other.value : other;

    if(!canCompare(this, other)) {
      throw new Exception(`Cannot divide a float with 'typeof ${typeof otherValue}'`, 'ERR_INVALID_TYPE');
    }

    if(otherValue === 0 || otherValue === 0.0) {
      throw new Exception('Cannot divide a number by zero', 'ERR_DIVISION_BY_ZERO');
    }

    return new FloatPoint(this.value / (otherValue as number));
  }

  public mod(): FloatPoint {
    throw new Exception('Modulo operation not supported for float point numbers', 'ERR_UNSUPPORTED_OPERATION');
  }

  public or(): FloatPoint {
    throw new Exception('Bitwise operations not supported for float point numbers', 'ERR_UNSUPPORTED_OPERATION');
  }

  public and(): FloatPoint {
    throw new Exception('Bitwise operations not supported for float point numbers', 'ERR_UNSUPPORTED_OPERATION');
  }

  public xor(): FloatPoint {
    throw new Exception('Bitwise operations not supported for float point numbers', 'ERR_UNSUPPORTED_OPERATION');
  }

  public not(): FloatPoint {
    throw new Exception('Bitwise operations not supported for float point numbers', 'ERR_UNSUPPORTED_OPERATION');
  }

  public toUnsigned(): FloatPoint {
    if(this.value < 0) {
      throw new Exception('Cannot convert negative float to unsigned', 'ERR_UNSUPPORTED_OPERATION');
    }

    return new FloatPoint(this.value, false);
  }
}


function canCompare(a: NumericObject, b?: NumericObject | number | bigint | null | undefined): boolean {
  if(
    typeof b !== 'number' &&
    typeof b !== 'bigint' &&
    !(b instanceof NumericObject)
  ) return false;

  const value = b instanceof NumericObject ?
    typeof (<any>b)[$state] === 'object' ?
      (<any>b)[$state].value as number | bigint :
      b.valueOf() :
    b;

  return typeof value === (a.bignumber ? 'bigint' : 'number');
}


export function int(value: number): Integer {
  return new Integer(value, true);
}

export function uint(value: number): UnsignedInteger {
  return new UnsignedInteger(value);
}

export function bigint(value: bigint | number): BigInteger {
  if(typeof value === 'number') {
    value = BigInt(value);
  }

  return new BigInteger(value, true);
}

export function float(value: number): FloatPoint {
  return new FloatPoint(value, true);
}


export default NumericObject;
