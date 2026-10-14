import { Platform } from 'react-native';
import NativeInAppReview from '../NativeInAppReview';
import { isAvailable, openStoreListing, requestReview } from '../index';

jest.mock('../NativeInAppReview');

const native = jest.mocked(NativeInAppReview);
const originalOS = Platform.OS;

function setPlatform(os: typeof Platform.OS) {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
}

afterEach(() => {
  jest.clearAllMocks();
  setPlatform(originalOS);
});

describe('isAvailable', () => {
  it('returns the native answer', async () => {
    native.isAvailable.mockResolvedValueOnce(false);
    await expect(isAvailable()).resolves.toBe(false);
  });
});

describe('requestReview', () => {
  it('delegates to the native module', async () => {
    await expect(requestReview()).resolves.toBeUndefined();
    expect(native.requestReview).toHaveBeenCalledTimes(1);
  });

  it('propagates native errors with their code', async () => {
    const error = Object.assign(new Error('no store'), {
      code: 'PLAY_STORE_NOT_FOUND',
    });
    native.requestReview.mockRejectedValueOnce(error);
    await expect(requestReview()).rejects.toMatchObject({
      code: 'PLAY_STORE_NOT_FOUND',
    });
  });
});

describe('openStoreListing', () => {
  const options = {
    iosAppId: '1234567890',
    androidPackageName: 'com.example.app',
  };

  it('passes the App Store ID on iOS', async () => {
    setPlatform('ios');
    await openStoreListing(options);
    expect(native.openStoreListing).toHaveBeenCalledWith('1234567890');
  });

  it('passes the package name on Android', async () => {
    setPlatform('android');
    await openStoreListing(options);
    expect(native.openStoreListing).toHaveBeenCalledWith('com.example.app');
  });

  it('passes null so Android falls back to its own package', async () => {
    setPlatform('android');
    await openStoreListing();
    expect(native.openStoreListing).toHaveBeenCalledWith(null);
  });
});
