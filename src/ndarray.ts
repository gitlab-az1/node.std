/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-inner-declarations */

import { Exception } from './errors';
import { isPlainObject } from './object';
import { assertUnsignedInteger } from './asserts';
import { $arrayAccessor, ArrayBase } from './array';


const $state = Symbol('NDARRAY::INTERNAL_DESCRIPTOR.InstanceState');


export namespace ndarray {
  export type DataType = 'integer' | 'decimal' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'int8' | 'int16' | 'int32' | 'float32' | 'float64';
  export type TypedConstructor = Uint8Array | Uint16Array | Uint32Array | BigUint64Array | Int8Array | Int16Array | Int32Array | BigInt64Array;

  type NDArrayState = {
    bucket: number[][];
    readonly dataType: DataType;
    readonly rows: number;
    readonly cols: number;
  };


  export class ndarray extends ArrayBase<number[][], number[]> {
    private [$state]: NDArrayState;
  
    public constructor(
      _shape: readonly [number, number] | { rows: number; cols: number },
      _dtype: DataType = 'decimal',
      _buffer?: readonly number[][] | readonly number[] | TypedConstructor,
      offset?: number // eslint-disable-line comma-dangle
    ) {
      super();
      validateDtype(_dtype);
      let rows = 2, cols = 2;
  
      if(Array.isArray(_shape)) {
        [rows, cols] = _shape;
      } else if(isPlainObject<{ rows: number; cols: number }>(_shape)) {
        rows = _shape.rows;
        cols = _shape.cols;
      } else {
        throw new Exception(`Unexpected 'typeof ${typeof _shape}' as ndarray shape`, 'ERR_INVALID_ARGUMENT');
      }
  
      const bucket = new Array(rows);
  
      for(let i = 0; i < rows; i++) {
        bucket[i] = new Array(cols).fill(0).map(() => Math.random() * 2 - 1);
  
        if(
          _buffer &&
          _buffer.length > 0 &&
          (Array.isArray(_buffer[0]) ? [..._buffer].every(item => Array.isArray(item) && item.length > 0) : true)
        ) {
          const is2D = Array.isArray(_buffer[0]);
  
          if(is2D) {
            if(!Array.isArray(_buffer[i])) {
              throw new Exception('When using a 2D array as ndarray buffer, all elements inside buffer must be other arrays', 'ERR_INVALID_ARGUMENT');
            }
  
            for(let j = 0; j < cols; j++) {
              const value = (_buffer as number[][])[i][(offset || 0) + j];
              validateValue(value, _dtype);

              bucket[i][j] = value;
            }
          } else {
            for(let j = 0; j < cols; j++) {
              const value = (_buffer as number[])[(offset || 0) + j];
              validateValue(value, _dtype);
              
              bucket[i][j] = value;
            }
          }
        }
      }
  
      this[$state] = {
        rows,
        cols,
        bucket,
        dataType: _dtype,
      };
    }

    public get [$arrayAccessor](): number[][] {
      return this[$state].bucket;
    }

    public set(value: number | number[], rowIndex: number): this;
    public set(value: number, rowIndex: number, columnIndex: number): this;
    public set(value: number | number[], i: number, j?: number): this {
      assertUnsignedInteger(i);

      if(typeof j === 'number') {
        assertUnsignedInteger(j);
      }

      if(typeof j !== 'number') {
        for(let ci = 0; ci < this[$state].bucket[i].length; ci++) {
          this[$state].bucket[i][ci] = Array.isArray(value) ? ci <= value.length - 1 ? value[ci] : 0 : value;
        }
      } else {
        this[$state].bucket[i][j] = Array.isArray(value) ? value[0] : value;
      }

      return this;
    }

    public get(rowIndex: number): number[] | undefined;
    public get(rowIndex: number, columnIndex: number): number | undefined;
    public get(i: number, j?: number): number | number[] | undefined {
      if(typeof j !== 'number') return this[$state].bucket[i];
      return this[$state].bucket[i][j];
    }

    public map<U>(callbackfn: (value: number, i: number, j: number, array: number[][]) => U): U[] {
      const output: U[] = [];

      for(let i = 0; i < this[$state].rows; i++) {
        for(let j = 0; j < this[$state].cols; j++) {
          const result = callbackfn(this[$state].bucket[i][j], i, j, [ ...this[$state].bucket ]);
          output.push(result);    
        }
      }

      return output;
    }

    public all<S extends number>(predicate: (value: number, i: number, j: number, array: number[][]) => value is S): boolean {
      let result = true;

      for(let i = 0; i < this[$state].rows; i++) {
        for(let j = 0 ; j < this[$state].cols; j++) {
          const methodResult = predicate(this[$state].bucket[i][j], i, j, [ ...this[$state].bucket ]);
          result = typeof methodResult === 'boolean' ? methodResult : !!methodResult;

          if(!result) break;
        }

        if(!result) break;
      }

      return result;
    }

    public any<S extends number>(predicate: (value: number, i: number, j: number, array: number[][]) => value is S): boolean {
      let result = false;

      for(let i = 0; i < this[$state].rows; i++) {
        for(let j = 0 ; j < this[$state].cols; j++) {
          const methodResult = predicate(this[$state].bucket[i][j], i, j, [ ...this[$state].bucket ]);
          result = typeof methodResult === 'boolean' ? methodResult : !!methodResult;

          if(result) break;
        }

        if(result) break;
      }

      return result;
    }

    public argmax(): number {
      return Math.max(...this[$state].bucket.flat());
    }

    public argmin(): number {
      return Math.min(...this[$state].bucket.flat());
    }

    public clippedArray(min: number, max: number = min + 1, filterMode: 'original' | 'pad' = 'pad'): number[][] {
      const root: number[][] = [];

      for(let i = 0; i < this[$state].rows; i++) {
        root[i] ??= [];

        for(let j = 0; j < this[$state].cols; j++) {
          const value = this[$state].bucket[i][j];

          if(value >= min && value <= max) {
            root[i].push(value);
          } else if(filterMode === 'pad') {
            root[i].push(0);
          }
        }
      }

      return root;
    }

    public slice(start?: number, end?: number): ndarray.ndarray {
      const sliced = this[$state].bucket.slice(start, end);
      return new ndarray([sliced.length, this[$state].cols], this[$state].dataType, sliced);
    }

    public copy<Target extends ArrayBase<number[][], number[]>>(target: Target, targetOffset = 0, sourceOffset = 0): void {
      for (let i = 0; i < this[$state].rows; i++) {
        for (let j = 0; j < this[$state].cols; j++) {
          target.set(this[$state].bucket[i][j], targetOffset + i, sourceOffset + j);
        }
      }
    }

    public clone(): ndarray.ndarray {
      const cloned = new ndarray([
        this[$state].rows,
        this[$state].cols,
      ], this[$state].dataType);

      cloned[$state].bucket = this[$state].bucket.map(row => [...row]);
      return cloned;
    }

    public at(index: number): number[] | undefined {
      assertUnsignedInteger(index);

      if(index > this[$state].rows - 1) {
        throw new Exception(`The index '${index}' is greater than ndarray rows`, 'ERR_OUT_OF_BOUNDS');
      }

      return [ ...this[$state].bucket[index] ];
    }

    public toArray(): number[][] {
      return [ ...this[$state].bucket ];
    }
  }
  
  
  export function validateDtype(dtype: DataType): void {
    const validTypes: DataType[] = [
      'integer',
      'decimal',
      'uint8',
      'uint16',
      'uint32',
      'uint64',
      'int8',
      'int16',
      'int32',
      'float32',
      'float64',
    ];
  
    if(!validTypes.includes(dtype)) {
      throw new Exception( `Invalid data type '${dtype}'. Expected one of ${validTypes.join(', ')}`, 'ERR_INVALID_ARGUMENT');
    }
  }
  
  export function validateValue(value: number, dtype: DataType): void {
    if(dtype === 'integer' && !Number.isInteger(value)) {
      throw new Exception(`Invalid value '${value}' for dtype '${dtype}'. Expected an integer.`, 'ERR_INVALID_ARGUMENT');
    }
  
    if(dtype === 'decimal' && typeof value !== 'number') {
      throw new Exception(`Invalid value '${value}' for dtype '${dtype}'. Expected a decimal number.`, 'ERR_INVALID_ARGUMENT');
    }
  
    if(dtype.startsWith('uint') && (value < 0 || !Number.isInteger(value))) {
      throw new Exception(`Invalid value '${value}' for dtype '${dtype}'. Expected a positive integer.`, 'ERR_INVALID_ARGUMENT');
    }
  
    if(dtype.startsWith('int') && !Number.isInteger(value)) {
      throw new Exception(`Invalid value '${value}' for dtype '${dtype}'. Expected an integer.`, 'ERR_INVALID_ARGUMENT');
    }
  }  
}

export default ndarray;
