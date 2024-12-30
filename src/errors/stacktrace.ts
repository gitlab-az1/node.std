export class StackTraceFrame {
  public readonly topLevel: boolean;

  public constructor(
    public readonly filename?: string,
    public readonly column?: number,
    public readonly line?: number,
    public readonly position?: number,
    public readonly source?: string,
    public readonly sourcePath?: string,
    public readonly origin?: string,
    public readonly isNative?: boolean,
    public readonly isConstructor?: boolean,
    _isTopLevel: boolean = false,
  ) { this.topLevel = _isTopLevel; }
}

export class StackTraceCollector {
  public static create(): StackTraceCollector {
    return new StackTraceCollector(new Error().stack || '');
  }

  public static parse(value: string): StackTraceCollector {
    return new StackTraceCollector(value);
  }

  public static parseFrames(stack: string | StackTraceCollector): readonly StackTraceFrame[] {
    if(stack instanceof StackTraceCollector) return Object.freeze( StackTraceCollector.#parseFrames(stack.toString(false)) );
    return Object.freeze( StackTraceCollector.#parseFrames(stack) );
  }

  public readonly frames: readonly StackTraceFrame[];

  private constructor(public readonly value: string) {
    this.frames = StackTraceCollector.#parseFrames(value);
  }

  public print(): void {
    console.log(this.value.split('\n').slice(2).join('\n'));
  }

  public files(): readonly string[] {
    return Object.freeze( this.frames.filter(item => !!item.filename).map(item => item.filename!) );
  }

  public lines(): readonly string[] {
    return Object.freeze( this.value.split('\n').slice(2) );
  }

  public toString(omitFirstLines: boolean = true): string {
    if(!omitFirstLines) return this.value.slice(0);
    return this.value.split('\n').slice(2).join('\n');
  }

  static #parseFrames(stack: string): StackTraceFrame[] {
    const lines = stack.split('\n').slice(2); // Skip the first two lines (Error + message)
    const frames: StackTraceFrame[] = [];

    for(let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // const match = line.match(/^\s*at\s+(?:(.*?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
      const match = line.match(/^\s*at\s+(?:(.+?)\s+\()?(.+):(\d+):(\d+)\)?$/);

      if(match) {
        const [, origin, filename, lineNum, colNum] = match;

        frames.push( new StackTraceFrame(
          filename.trim(),
          parseInt(colNum, 10),
          parseInt(lineNum, 10),
          undefined,
          line.trim(),
          undefined,
          origin?.trim() || undefined,
          line.includes('[native code]'),
          origin?.includes('new ') || false,
          i === 0 // eslint-disable-line comma-dangle
        ) );
      }
    }

    return frames;
  }
}

export default StackTraceCollector;
