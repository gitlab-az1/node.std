export interface NumberHandler {
  readonly value: number;
  asSigned(): number;
  asUnsigned(): number;
  add(value: NumberHandler): NumberHandler;
  sub(value: NumberHandler): NumberHandler;
  mul(value: NumberHandler): NumberHandler;
  div(value: NumberHandler): NumberHandler;
  mod(value: NumberHandler): NumberHandler;
  and(value: NumberHandler): NumberHandler;
  or(value: NumberHandler): NumberHandler;
  xor(value: NumberHandler): NumberHandler;
  not(): NumberHandler;
  shl(value: NumberHandler): NumberHandler;
  shr(value: NumberHandler): NumberHandler;
  eq(value: NumberHandler): boolean;
  ne(value: NumberHandler): boolean;
  lt(value: NumberHandler): boolean;
  le(value: NumberHandler): boolean;
  gt(value: NumberHandler): boolean;
  ge(value: NumberHandler): boolean;
  isZero(): boolean;
  isNegative(): boolean;
  valueOf(): number;
  [Symbol.toStringTag](): string;
}


export interface BigNumberHandler {
  readonly value: bigint;
  asSigned(): bigint;
  asUnsigned(): bigint;
  add(value: BigNumberHandler): BigNumberHandler;
  sub(value: BigNumberHandler): BigNumberHandler;
  mul(value: BigNumberHandler): BigNumberHandler;
  div(value: BigNumberHandler): BigNumberHandler;
  mod(value: BigNumberHandler): BigNumberHandler;
  and(value: BigNumberHandler): BigNumberHandler;
  or(value: BigNumberHandler): BigNumberHandler;
  xor(value: BigNumberHandler): BigNumberHandler;
  not(): BigNumberHandler;
  shl(value: BigNumberHandler): BigNumberHandler;
  shr(value: BigNumberHandler): BigNumberHandler;
  eq(value: BigNumberHandler): boolean;
  ne(value: BigNumberHandler): boolean;
  lt(value: BigNumberHandler): boolean;
  le(value: BigNumberHandler): boolean;
  gt(value: BigNumberHandler): boolean;
  ge(value: BigNumberHandler): boolean;
  isZero(): boolean;
  isNegative(): boolean;
  valueOf(): bigint;
  [Symbol.toStringTag](): string;
}
