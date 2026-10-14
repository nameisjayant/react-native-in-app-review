# @nameisjayant/react-native-in-app-review

Native in-app review prompt for React Native (Google Play In-App Review on Android, SKStoreReviewController on iOS)

## Installation


```sh
npm install @nameisjayant/react-native-in-app-review
```


## Usage

```tsx
import {
  isAvailable,
  requestReview,
  openStoreListing,
} from '@nameisjayant/react-native-in-app-review';

// After a positive moment (finished a level, saved a document, ...):
if (await isAvailable()) {
  try {
    await requestReview();
  } catch (error) {
    console.warn((error as { code?: string }).code);
  }
}

// From an explicit "Rate us" button:
await openStoreListing({ iosAppId: '1234567890' });
```

## API

### `isAvailable(): Promise<boolean>`

Whether the native prompt can be requested. Android: the Google Play Store is installed. iOS: always `true`. Web: `false`.

### `requestReview(): Promise<void>`

Asks the store to show its in-app review prompt — [Google Play In-App Review](https://developer.android.com/guide/playcore/in-app-review) on Android, [`SKStoreReviewController`](https://developer.apple.com/documentation/storekit/skstorereviewcontroller/) on iOS.

- **Android** resolves once the review flow has finished.
- **iOS** resolves once the request has been handed to StoreKit.

Neither store tells you whether the prompt was shown or a review was submitted, and both enforce quotas (iOS shows it at most 3 times in 365 days; Play applies a time-bound quota). So:

- Don't call it from a button — the prompt may not appear. Use `openStoreListing()` for that.
- Don't ask the user a question (e.g. "Do you like the app?") before it.
- Continue your app flow the same way whether it resolves or rejects.

### `openStoreListing(options?): Promise<void>`

Opens the store page so the user can write a review. Safe to call from a button.

| Option | Platform | Description |
| --- | --- | --- |
| `iosAppId` | iOS | Numeric App Store ID (required on iOS). Opens `apps.apple.com/app/id<ID>?action=write-review`. |
| `androidPackageName` | Android | Defaults to the running app's package. Opens the Play Store app, or the Play website if it's missing. |

### Error codes

Rejections carry an `error.code` (exported as the `InAppReviewErrorCode` type):

| Code | Platform | Meaning |
| --- | --- | --- |
| `NO_ACTIVITY` | Android | No foreground activity to attach the flow to. |
| `REVIEW_IN_PROGRESS` | Android | `requestReview()` called while a flow is still running. |
| `PLAY_STORE_NOT_FOUND` | Android | Play Store missing or unofficial. |
| `INVALID_REQUEST` | Android | Play rejected the request. |
| `INTERNAL_ERROR` | Android | Unexpected Play Store error. |
| `NO_WINDOW_SCENE` | iOS | No foreground window scene to present in. |
| `MISSING_APP_ID` | iOS | `openStoreListing()` called without a numeric `iosAppId`. |
| `OPEN_URL_FAILED` | Both | The store page could not be opened. |
| `UNSUPPORTED` | Web | No native review prompt on this platform. |
| `UNKNOWN` | Android | Any other failure. |

## Testing the prompt

- **Android:** the dialog only appears for apps installed from Google Play. Use [internal app sharing or an internal test track](https://developer.android.com/guide/playcore/in-app-review/test); a sideloaded debug build completes the flow without showing anything.
- **iOS:** in development builds the prompt is always shown (it's never submitted). In TestFlight it is never shown. In App Store builds StoreKit applies its quota.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
