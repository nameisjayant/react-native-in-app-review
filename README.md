<div align="center">

<h1>⭐️ React Native In-App Review</h1>

<p>
  <strong>Ask for a rating without ever leaving your app.</strong><br />
  A tiny, typed TurboModule over Google Play In-App Review and Apple's <code>SKStoreReviewController</code>.
</p>

<p>
  <a href="https://www.npmjs.com/package/@nameisjayant/react-native-in-app-review"><img alt="npm version" src="https://img.shields.io/npm/v/@nameisjayant/react-native-in-app-review?style=flat-square&color=111111&labelColor=111111" /></a>
  <a href="https://www.npmjs.com/package/@nameisjayant/react-native-in-app-review"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@nameisjayant/react-native-in-app-review?style=flat-square&color=111111&labelColor=111111" /></a>
  <a href="https://github.com/nameisjayant/react-native-in-app-review/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/nameisjayant/react-native-in-app-review/ci.yml?branch=main&style=flat-square&label=CI&labelColor=111111" /></a>
  <img alt="platforms" src="https://img.shields.io/badge/platforms-android%20%7C%20ios-111111?style=flat-square&labelColor=111111" />
  <img alt="new architecture" src="https://img.shields.io/badge/new%20architecture-ready-111111?style=flat-square&labelColor=111111" />
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/github/license/nameisjayant/react-native-in-app-review?style=flat-square&color=111111&labelColor=111111" /></a>
</p>

<p>
  <a href="https://nameisjayant.github.io/react-native-in-app-review/"><strong>🌐 Website</strong></a> ·
  <a href="#-installation">Installation</a> ·
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-api">API</a> ·
  <a href="#-error-codes">Error codes</a> ·
  <a href="#-testing-the-prompt">Testing</a>
</p>

</div>

<br />

## ✨ Highlights

|     |     |
| --- | --- |
| 🪶 **Three functions, that's it** | `isAvailable()`, `requestReview()`, `openStoreListing()` — nothing to configure. |
| 📱 **Truly native** | Google Play In-App Review on Android, `SKStoreReviewController` on iOS. |
| ⚡️ **New Architecture** | Built as a TurboModule with codegen — no bridge overhead. |
| 🔒 **Fully typed** | Promise-based API with a typed `InAppReviewErrorCode` union for every rejection. |
| 🛟 **Graceful fallback** | A "Rate us" button helper that opens the store's write-review page on both platforms. |
| 🌐 **Web safe** | Imports cleanly on web — `isAvailable()` simply returns `false`. |

<br />

## 📦 Installation

```sh
npm install @nameisjayant/react-native-in-app-review
# or
yarn add @nameisjayant/react-native-in-app-review
```

Then install the iOS pods:

```sh
cd ios && pod install
```

That's all — autolinking handles the rest. No permissions, no manifest edits, no `Info.plist` keys.

> [!NOTE]
> Using Expo? This library contains native code, so it runs in a [development build](https://docs.expo.dev/develop/development-builds/introduction/), not in Expo Go.

### Requirements

| | Minimum |
| --- | --- |
| **React Native** | New Architecture enabled |
| **Android** | `minSdkVersion 24`, Google Play Store on the device |
| **iOS** | React Native's minimum supported iOS version |

<br />

## 🚀 Quick start

```tsx
import {
  isAvailable,
  requestReview,
  openStoreListing,
} from '@nameisjayant/react-native-in-app-review';

// 1. After a happy moment — finished a level, saved a document, hit a streak…
async function onLevelComplete() {
  if (await isAvailable()) {
    try {
      await requestReview();
    } catch (error) {
      console.warn((error as { code?: string }).code);
    }
  }
  // Carry on with your flow either way.
}

// 2. From an explicit "Rate us" button in Settings
function RateUsButton() {
  return (
    <Button
      title="Rate us"
      onPress={() => openStoreListing({ iosAppId: '1234567890' })}
    />
  );
}
```

<br />

## 📖 API

### `isAvailable()`

```ts
isAvailable(): Promise<boolean>
```

Whether the native prompt can be requested on this device.

| Platform | Returns |
| --- | --- |
| Android | `true` when the Google Play Store is installed |
| iOS | Always `true` |
| Web | Always `false` |

---

### `requestReview()`

```ts
requestReview(): Promise<void>
```

Asks the store to show its in-app review prompt — [Google Play In-App Review](https://developer.android.com/guide/playcore/in-app-review) on Android, [`SKStoreReviewController`](https://developer.apple.com/documentation/storekit/skstorereviewcontroller/) on iOS.

- **Android** resolves once the review flow has finished.
- **iOS** resolves once the request has been handed to StoreKit.

| Android | iOS |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/nameisjayant/react-native-in-app-review/main/docs/assets/android.png" alt="Google Play in-app review flow" width="560" /> | <img src="https://raw.githubusercontent.com/nameisjayant/react-native-in-app-review/main/docs/assets/ios.png" alt="iOS SKStoreReviewController rating prompt" width="200" /> |
| Google Play In-App Review flow | `SKStoreReviewController` rating prompt |

> [!IMPORTANT]
> Neither store tells you whether the prompt was actually shown or whether a review was submitted, and both enforce quotas — iOS shows it **at most 3 times in 365 days**, and Google Play applies its own time-bound quota. A resolved promise only means the request finished.

**Best practices**

- ✅ Call it after a positive moment, when the user has had time to enjoy your app.
- ✅ Continue your app flow the same way whether it resolves or rejects.
- ❌ Don't call it from a button — the prompt may not appear. Use `openStoreListing()` instead.
- ❌ Don't ask a leading question first (e.g. *"Do you like the app?"*) — both stores' guidelines discourage it.

---

### `openStoreListing(options?)`

```ts
openStoreListing(options?: StoreListingOptions): Promise<void>
```

Opens your app's store page so the user can write a review. Safe to call from a button.

| Option | Platform | Description |
| --- | --- | --- |
| `iosAppId` | iOS | Numeric App Store ID — **required on iOS**. Opens `apps.apple.com/app/id<ID>?action=write-review`. |
| `androidPackageName` | Android | Defaults to the running app's package. Opens the Play Store app, or the Play website if it's missing. |

```ts
await openStoreListing({
  iosAppId: '1234567890',
  androidPackageName: 'com.example.app', // optional
});
```

<br />

## 🚨 Error codes

Every rejection carries an `error.code`, exported as the `InAppReviewErrorCode` type:

```ts
import type { InAppReviewErrorCode } from '@nameisjayant/react-native-in-app-review';
```

| Code | Platform | Meaning |
| --- | :---: | --- |
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

<br />

## 🧪 Testing the prompt

<table>
  <tr>
    <th width="50%">🤖 Android</th>
    <th width="50%"> iOS</th>
  </tr>
  <tr>
    <td valign="top">
      The dialog only appears for apps <strong>installed from Google Play</strong>.
      Use <a href="https://developer.android.com/guide/playcore/in-app-review/test">internal app sharing or an internal test track</a>.
      A sideloaded debug build completes the flow without showing anything.
    </td>
    <td valign="top">
      In <strong>development</strong> builds the prompt is always shown (and never submitted).
      In <strong>TestFlight</strong> it is never shown.
      In <strong>App Store</strong> builds StoreKit applies its quota.
    </td>
  </tr>
</table>

> [!TIP]
> The [`example/`](example) app wires up all three functions — run it with `yarn example android` or `yarn example ios`.

<br />

## 🤝 Contributing

Contributions are welcome! Please read the guides before opening a pull request:

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

<br />

## 📄 License

[MIT](LICENSE) © [Jayant Kumar](https://github.com/nameisjayant)

<br />

<div align="center">
  <sub>If this library saved you some time, consider giving it a ⭐️ on GitHub.</sub><br />
  <sub>Built with <a href="https://github.com/callstack/react-native-builder-bob">create-react-native-library</a>.</sub>
</div>
