import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Whether the native review prompt can be requested on this device.
   * Android: Google Play Store is installed. iOS: always true.
   */
  isAvailable(): Promise<boolean>;
  /**
   * Requests the native review prompt.
   * Android: resolves once the Play review flow has finished.
   * iOS: resolves once the request has been handed to StoreKit.
   */
  requestReview(): Promise<void>;
  /**
   * Opens the store page so the user can write a review.
   * Android: package name (defaults to this app's package when null).
   * iOS: numeric App Store ID (required).
   */
  openStoreListing(appId: string | null): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('InAppReview');
