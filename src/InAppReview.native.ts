import { Platform } from 'react-native';
import NativeInAppReview from './NativeInAppReview';
import type { StoreListingOptions } from './types';

/**
 * Whether the native review prompt can be requested on this device.
 * On Android this checks that the Google Play Store is installed.
 */
export function isAvailable(): Promise<boolean> {
  return NativeInAppReview.isAvailable();
}

/**
 * Asks the store to show its in-app review prompt.
 *
 * The stores enforce quotas and never say whether the prompt was shown or a
 * review was left, so a resolved promise only means the request finished.
 * Don't call this from a button; use `openStoreListing()` for that.
 */
export function requestReview(): Promise<void> {
  return NativeInAppReview.requestReview();
}

/**
 * Opens the app's store page so the user can write a review.
 * Safe to call from an explicit "Rate us" button.
 */
export function openStoreListing(
  options: StoreListingOptions = {}
): Promise<void> {
  const appId =
    Platform.OS === 'ios' ? options.iosAppId : options.androidPackageName;
  return NativeInAppReview.openStoreListing(appId ?? null);
}
