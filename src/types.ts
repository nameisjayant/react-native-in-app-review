export type InAppReviewErrorCode =
  /** Android: no foreground activity to attach the review flow to. */
  | 'NO_ACTIVITY'
  /** Android: `requestReview()` was called while a previous flow is still running. */
  | 'REVIEW_IN_PROGRESS'
  /** Android: the Play Store is missing or unofficial. */
  | 'PLAY_STORE_NOT_FOUND'
  /** Android: Play rejected the request. */
  | 'INVALID_REQUEST'
  /** Android: unexpected Play Store error. */
  | 'INTERNAL_ERROR'
  /** iOS: no foreground window scene to present the prompt in. */
  | 'NO_WINDOW_SCENE'
  /** iOS: `openStoreListing()` was called without a numeric `iosAppId`. */
  | 'MISSING_APP_ID'
  /** The store page could not be opened. */
  | 'OPEN_URL_FAILED'
  /** The current platform has no native review prompt (e.g. web). */
  | 'UNSUPPORTED'
  | 'UNKNOWN';

export interface StoreListingOptions {
  /** Numeric App Store ID, e.g. `'1234567890'`. Required on iOS. */
  iosAppId?: string;
  /** Play Store package name. Defaults to the running app's package on Android. */
  androidPackageName?: string;
}
