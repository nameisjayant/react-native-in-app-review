import { multiply } from '../index';

jest.mock('../NativeInAppReview');

describe('multiply', () => {
  it('delegates to the native module', () => {
    expect(multiply(3, 7)).toBe(21);
  });
});
