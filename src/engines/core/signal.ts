import { Exception } from '../../errors';
import { assertFunction } from '../../asserts';


export const enum SIGNAL {
  CONTINUE = 'CONTINUE',
  STOP_PROPAGATION = 'STOP_PROPAGATION',
}


type SignalListener = {
  callback: (...args: any[]) => SIGNAL | void;
  thisArg?: any;
}

export class WeakSignal {
  #listeners: Set<SignalListener> = new Set();
  #modifyCount = 0;
  readonly #strict: boolean = false;

  public constructor(_strict?: boolean) {
    if(typeof _strict === 'boolean') {
      this.#strict = _strict;
    }
  }

  public addListener(callback: (...args: any[]) => SIGNAL | void, thisArg?: any): number {
    assertFunction(callback);

    this.#listeners.add({ callback, thisArg });
    return ++this.#modifyCount;
  }

  public dispatch(...args: any[]): SIGNAL | null {
    const modifyCount = this.#modifyCount;
    const listeners = [ ...this.#listeners ];

    for(let i = 0; i < listeners.length; i++) {
      const { callback, thisArg = null } = listeners[i];

      if(callback.apply(thisArg, args) === SIGNAL.STOP_PROPAGATION)
        return SIGNAL.STOP_PROPAGATION;

      if(modifyCount !== this.#modifyCount) return SIGNAL.STOP_PROPAGATION;
    }

    return this.#strict ? null : SIGNAL.CONTINUE;
  }

  public removeListener(listener: (...args: any[]) => unknown): void {
    const arr = [ ...this.#listeners ];
    const index = arr.findIndex(item => item.callback === listener);

    if(index < 0) {
      throw new Exception('Cannot remove an unknown listener from WeakSignal', 'ERR_RESOURCE_NOT_FOUND');
    }

    arr.splice(index, 1);
    this.#listeners = new Set(arr);

    this.#modifyCount++;
  }

  public clear(): void {
    this.#listeners.clear();
    this.#modifyCount++;
  }
}
