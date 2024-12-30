export const $arrayAccessor = Symbol('ARRAY::BUCKET_ACCESSOR');


export abstract class ArrayBase<T, TIndexed extends (T extends any[] ? T[number] : T)> implements RelativeIndexable<TIndexed> {
  public abstract readonly [$arrayAccessor]: T;
  
  public abstract set(...args: any[]): unknown;
  public abstract get(...args: any[]): unknown;
  public abstract copy<Target extends ArrayBase<T, TIndexed>>(target: Target, targetOffset?: number, sourceOffset?: number): void;
  public abstract clone(): ArrayBase<T, TIndexed>;
  public abstract at(index: number): TIndexed | undefined;
}
