import { WeakSignal } from './signal';
import { IDisposable } from '../../disposable';
import type { MaybePromise } from '../../types';


// TEMPORARY ALIAS FOR APP LOGGER
const logger = console;


export type StateOptions = {
  revalidate?: (value?: any) => MaybePromise<void>;
}

export class State<T> implements IDisposable {
  #value: T;
  readonly #revalidateSignal: WeakSignal;

  public constructor(
    initialValue: T,
    options?: StateOptions // eslint-disable-line comma-dangle
  ) {
    this.#value = initialValue;
    this.#revalidateSignal = new WeakSignal();

    if(typeof options?.revalidate !== 'function') {
      this.#revalidateSignal.addListener(value => {
        try {
          // Await the revalidate function safely
          options?.revalidate?.(value)?.catch?.(err => {
            logger.error('Error in state revalidate function', err);
          });
        } catch (err: any) {
          logger.error('Error in state revalidate function', err);
        }
      });
    }
  }

  public get(): T {
    return this.#value;
  }

  public set(value: T): this {
    this.#value = value;
    this.#revalidateSignal.dispatch(value);

    return this;
  }

  public onUpdate(callback: (value: T) => void): this {
    this.#revalidateSignal.addListener(callback);
    return this;
  }

  public offUpdate(callback: (value: T) => void): this {
    this.#revalidateSignal.removeListener(callback);
    return this;
  }

  public dispose(): void {
    this.#revalidateSignal.clear();
  }
}

export class AsyncState<T> implements IDisposable {
  #value: T;
  readonly #revalidateSignal: WeakSignal;
  #lock: boolean = false; // Lock for concurrency
  #updateQueue: (() => void)[] = []; // Queue for batched updates

  public constructor(
    initialValue: T,
    options?: StateOptions // eslint-disable-line comma-dangle
  ) {
    this.#value = initialValue;
    this.#revalidateSignal = new WeakSignal();

    if(typeof options?.revalidate !== 'function') {
      this.#revalidateSignal.addListener(value => {
        try {
          // Await the revalidate function safely
          options?.revalidate?.(value)?.catch?.(err => {
            logger.error('Error in state revalidate function', err);
          });
        } catch (err: any) {
          logger.error('Error in state revalidate function', err);
        }
      });
    }
  }

  public get(): T {
    return this.#value;
  }

  public async set(value: T): Promise<this> {
    if(this.#value === value) return this;

    if(this.#lock) return new Promise((resolve) => {
      this.#updateQueue.push(() => {
        this.#value = value;
        this.#revalidateSignal.dispatch(value);
        resolve(this);
      });
    });

    this.#lock = true;
    this.#value = value;
    this.#revalidateSignal.dispatch(value);
    
    await this.#processQueue();
    return this;
  }

  public onUpdate(callback: (value: T) => void): this {
    this.#revalidateSignal.addListener(callback);
    return this;
  }

  public offUpdate(callback: (value: T) => void): this {
    this.#revalidateSignal.removeListener(callback);
    return this;
  }

  async #processQueue(): Promise<void> {
    while(this.#updateQueue.length > 0) {
      const nextUpdate = this.#updateQueue.shift();

      if(nextUpdate) {
        nextUpdate();
      }
    }

    this.#lock = false;
  }

  public dispose(): void {
    this.#revalidateSignal.clear();
    this.#updateQueue.length = 0;
    this.#lock = false;
  }
}


export function useState<S>(initialValue: S | (() => S)): State<S>;
export function useState<S = undefined>(): State<S | undefined>;
export function useState<S>(initialValue?: S | (() => S)): State<S | undefined> {
  let value: S | undefined = void 0;

  if(typeof initialValue !== 'undefined') {
    value = typeof initialValue === 'function' ?
      (initialValue as () => S)() :
      initialValue;
  }

  return new State(value);
}


export function useAsyncState<S>(initialValue: S | (() => S)): AsyncState<S>;
export function useAsyncState<S = undefined>(): AsyncState<S | undefined>;
export function useAsyncState<S>(initialValue?: S | (() => S)): AsyncState<S | undefined> {
  let value: S | undefined = void 0;

  if(typeof initialValue !== 'undefined') {
    value = typeof initialValue === 'function' ?
      (initialValue as () => S)() :
      initialValue;
  }

  return new AsyncState(value);
}


export default useState;
