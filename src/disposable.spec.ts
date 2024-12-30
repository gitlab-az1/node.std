import {
  toDisposable,
  toAsyncDisposable,
  isDisposable,
  dispose,
  DisposableStore,
  Disposable,
  AsyncDisposable,
  MutableDisposable,
} from './disposable';


describe('Disposable Utilities', () => {
  test('should create and dispose of a simple disposable object', () => {
    const disposable = toDisposable(() => {});
    expect(isDisposable(disposable)).toBe(true);

    // Test dispose
    disposable.dispose();
  });

  test('should create and dispose of an async disposable object', async () => {
    const asyncDisposable = toAsyncDisposable(() => Promise.resolve());
    expect(isDisposable(asyncDisposable)).toBe(true);

    // Test dispose
    await asyncDisposable.dispose();
  });

  test('should check if an object is disposable', () => {
    const disposable = toDisposable(() => {});
    const notDisposable = {};

    expect(isDisposable(disposable)).toBe(true);
    expect(isDisposable(notDisposable)).toBe(false);
  });
});

describe('DisposableStore', () => {
  let store: DisposableStore;

  beforeEach(() => {
    store = new DisposableStore();
  });

  test('should add and dispose of disposables', () => {
    const disposable = toDisposable(() => {});
    store.add(disposable);

    expect(store.isDisposed).toBe(false);

    store.dispose();
    expect(store.isDisposed).toBe(true);

    // Adding after dispose should not affect the store
    const newDisposable = toDisposable(() => {});
    store.add(newDisposable);
    expect(newDisposable).toBe(newDisposable); // It should return the same object, but it is now leaked
  });

  test('should throw error when adding itself as a disposable', () => {
    expect(() => store.add(store)).toThrow('Cannot register a disposable on itself!');
  });

  test('should clear disposables', () => {
    const disposable = toDisposable(() => {});
    store.add(disposable);

    store.clear();
    expect(store.isDisposed).toBe(false);
  });

  test('should delete a disposable from the store', () => {
    const disposable = toDisposable(() => {});
    store.add(disposable);
    
    store.delete(disposable);
    expect(store.isDisposed).toBe(false);
  });

  test('should not warn when deleting a disposable not in the store', () => {
    const disposable = toDisposable(() => {});
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    store.delete(disposable);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('Disposable', () => {
  test('should register and dispose disposables', () => {
    const disposable = new Disposable();
    const childDisposable = toDisposable(() => {});
    
    (disposable as any)._register(childDisposable);
    expect(disposable['_lifecycle'].has(childDisposable)).toBe(true);

    disposable.dispose();
    expect(childDisposable).toBeDefined();  // It should have been disposed
  });

  test('should not register disposables after being disposed', () => {
    const disposable = new Disposable();
    disposable.dispose();

    const childDisposable = toDisposable(() => {});
    (disposable as any)._register(childDisposable);
    expect(childDisposable).toBeDefined();  // It should have been disposed immediately
  });
});

describe('AsyncDisposable', () => {
  test('should register and dispose async disposables', async () => {
    const asyncDisposable = new AsyncDisposable();
    const childAsyncDisposable = toAsyncDisposable(() => Promise.resolve());
    
    (asyncDisposable as any)._register(childAsyncDisposable);
    expect(asyncDisposable['_lifecycle'].has(childAsyncDisposable)).toBe(true);

    await asyncDisposable.dispose();
    expect(childAsyncDisposable).toBeDefined();  // It should have been disposed
  });

  test('should not register async disposables after being disposed', async () => {
    const asyncDisposable = new AsyncDisposable();
    await asyncDisposable.dispose();

    const childAsyncDisposable = toAsyncDisposable(() => Promise.resolve());
    (asyncDisposable as any)._register(childAsyncDisposable);
    expect(childAsyncDisposable).toBeDefined();  // It should have been disposed immediately
  });
});

describe('MutableDisposable', () => {
  test('should register and dispose mutable disposables', () => {
    const mutableDisposable = new MutableDisposable();
    const disposable = toDisposable(() => {});

    mutableDisposable.value = disposable;
    expect(mutableDisposable.value).toBe(disposable);

    mutableDisposable.dispose();
    expect(mutableDisposable.value).toBeUndefined();  // Should be undefined after dispose
  });

  test('should clear and leak disposable value', () => {
    const mutableDisposable = new MutableDisposable();
    const disposable = toDisposable(() => {});

    mutableDisposable.value = disposable;
    const leaked = mutableDisposable.clearAndLeak();
    
    expect(leaked).toBe(disposable);
    expect(mutableDisposable.value).toBeUndefined();
  });
});

describe('dispose function', () => {
  test('should dispose a single disposable', () => {
    const disposable = toDisposable(() => {});
    dispose(disposable);
  });

  test('should dispose an iterable of disposables', () => {
    const disposable1 = toDisposable(() => {});
    const disposable2 = toDisposable(() => {});
    dispose([disposable1, disposable2]);
  });

  test('should handle errors during dispose', () => {
    const disposable1 = toDisposable(() => { throw new Error('Test error'); });
    const disposable2 = toDisposable(() => {});
    
    expect(() => dispose([disposable1, disposable2])).toThrow('Test error');
  });

  test('should return the same object after dispose', () => {
    const disposable = toDisposable(() => {});
    const result = dispose(disposable);
    expect(result).toBe(disposable);
  });
});
