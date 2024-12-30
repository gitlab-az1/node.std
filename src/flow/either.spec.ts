import { Left as LeftClass, Right as RightClass, left, right } from './either';


describe('Either flow control', () => {
  test('left() should create a new Either<null, Right> instance', () => {
    const leftValue = left(null);

    expect(leftValue).toBeInstanceOf(LeftClass);
    expect(leftValue.isLeft()).toBe(true);
    expect(leftValue.isRight()).toBe(false);
    expect(leftValue.value).toBe(null);
  });

  test('right() should create a new Either<Left, null> instance', () => {
    const rightValue = right(null);

    expect(rightValue).toBeInstanceOf(RightClass);
    expect(rightValue.isLeft()).toBe(false);
    expect(rightValue.isRight()).toBe(true);
    expect(rightValue.value).toBe(null);
  });
});
