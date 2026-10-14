import type { StoreListingOptions } from './types';

function unsupported(): Promise<never> {
  const error = new Error(
    "'@nameisjayant/react-native-in-app-review' is only supported on native platforms."
  ) as Error & { code: string };
  error.code = 'UNSUPPORTED';
  return Promise.reject(error);
}

export function isAvailable(): Promise<boolean> {
  return Promise.resolve(false);
}

export function requestReview(): Promise<void> {
  return unsupported();
}

export function openStoreListing(
  _options: StoreListingOptions = {}
): Promise<void> {
  return unsupported();
}
