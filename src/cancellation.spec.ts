import { CancellationToken, CancellationTokenSource, isCancellationToken } from './cancellation';


describe('CancellationToken Tests', () => {
  test('CancellationToken.None should not be cancellable', () => {
    expect(CancellationToken.None.isCancellationRequested).toBe(false);
    expect(typeof CancellationToken.None.onCancellationRequested).toBe('function');
  });

  test('CancellationToken.Cancelled should be already cancelled', () => {
    expect(CancellationToken.Cancelled.isCancellationRequested).toBe(true);
    expect(typeof CancellationToken.Cancelled.onCancellationRequested).toBe('function');
  });

  test('isCancellationToken should validate tokens correctly', () => {
    const validToken = { isCancellationRequested: false, onCancellationRequested: jest.fn() };
    const invalidToken = { invalidField: true };

    expect(isCancellationToken(validToken)).toBe(true);
    expect(isCancellationToken(invalidToken)).toBe(false);
  });
});

describe('CancellationTokenSource Tests', () => {
  test('Initial token should not be cancelled', () => {
    const source = new CancellationTokenSource();
    expect(source.token.isCancellationRequested).toBe(false);
  });

  test('Cancel should mark the token as cancelled', () => {
    const source = new CancellationTokenSource();

    source.cancel();
    expect(source.token.isCancellationRequested).toBe(true);
  });

  test('Cancel should fire cancellation event', () => {
    const source = new CancellationTokenSource();
    const listener = jest.fn();

    source.token.onCancellationRequested(listener);
    source.cancel();
    
    expect(listener).toHaveBeenCalled();
  });

  test('Dispose without cancel should not mark token as cancelled', () => {
    const source = new CancellationTokenSource();

    source.dispose(false);
    expect(source.token.isCancellationRequested).toBe(false);
  });

  test('Dispose with cancel should mark token as cancelled', () => {
    const source = new CancellationTokenSource();

    source.dispose(true);
    expect(source.token.isCancellationRequested).toBe(true);
  });

  test('Dispose should clean up parent listener if set', () => {
    const parent = new CancellationTokenSource();
    const child = new CancellationTokenSource(parent.token);

    child.dispose();
    expect(parent.token.isCancellationRequested).toBe(false);
  });
});
