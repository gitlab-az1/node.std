import { Exception } from '../errors';


/**
 * Represents a promise-like object that can be resolved asynchronously.
 * Extends the PromiseLike interface.
 */
export interface Thenable<T> extends PromiseLike<T> { }


/**
 * Represents a promise that can be cancelled.
 * Extends the native Promise interface.
 */
export interface CancelablePromise<T> extends Promise<T> {

  /**
   * Cancels the promise.
   */
  cancel(): void;
}


export function withAsyncBody<T, E = Error>(bodyfn: (resolve: (value: T) => unknown, reject: (error: E) => unknown) => Promise<unknown>): Promise<T> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<T>(async (resolve, reject) => {
    try {
      await bodyfn(resolve, reject);
    } catch (error: any) {
      reject(error);
    }
  });
}

export function withTimeout<T, E = Error>(bodyfn: (resolve: (value: T) => unknown, reject: (error: E) => unknown) => unknown, timeout: number = 750): Promise<T> {
  return Promise.race([
    new Promise(bodyfn),
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Exception(`Timeout exceded for asynchronous operation in ${timeout}ms`, 'ERR_TIMEOUT'));
      }, timeout);
    }),
  ]);
}

export function withAsyncBodyAndTimeout<T, E = Error>(bodyfn: (resolve: (value: T) => unknown, reject: (error: E) => unknown) => unknown, timeout: number = 750): Promise<T> {
  return Promise.race([
    // eslint-disable-next-line no-async-promise-executor
    new Promise<T>(async (resolve, reject) => {
      try {
        await bodyfn(resolve, reject);
      } catch (error: any) {
        reject(error);
      }
    }),

    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Exception(`Timeout exceded for asynchronous operation in ${timeout}ms`, 'ERR_TIMEOUT'));
      }, timeout);
    }),
  ]);
}
