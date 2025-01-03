const hasPerformanceNow = (
  (globalThis.performance && typeof globalThis.performance.now === 'function') ||
  (typeof performance !== 'undefined' && typeof performance.now === 'function')
);


export function timestamp(highResolution: boolean = true): number {
  return hasPerformanceNow && highResolution !== false ? Date.now() : (globalThis.performance?.now || performance.now)();
}


type Unit = 'ms' | 's' | 'm' | 'h';

export class StopWatch {
  readonly #now: () => number;

  #startTime: number;
  #stopTime: number;

  public constructor(highResolution?: boolean) {
    this.#now = () => timestamp(highResolution);

    this.#startTime = this.#now();
    this.#stopTime = -1;
  }

  public stop(): void {
    this.#stopTime = this.#now();
  }

  public reset(): void {
    this.#startTime = this.#now();
    this.#stopTime = -1;
  }

  /**
   * Returns the elapsed time since the stopwatch was started.
   * 
   * @param [unit='ms'] The unit of time to return the elapsed time in.
   * @returns {number} The elapsed time in the specified unit.
   */
  public elapsed(unit: Unit = 'ms'): number {
    const t: number = this.#stopTime !== -1 ? this.#stopTime - this.#startTime : this.#now() - this.#startTime;

    switch(unit) {
      case 's':
        return t / 1000;
      case 'm':
        return t / 60000;
      case 'h':
        return t / 3600000;
      default:
        return t;
    }
  }
}
