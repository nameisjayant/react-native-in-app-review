package com.inappreview

import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.google.android.play.core.review.ReviewException
import com.google.android.play.core.review.ReviewManager
import com.google.android.play.core.review.ReviewManagerFactory
import com.google.android.play.core.review.model.ReviewErrorCode
import java.util.concurrent.atomic.AtomicBoolean

class InAppReviewModule(reactContext: ReactApplicationContext) :
  NativeInAppReviewSpec(reactContext) {

  private val reviewManager: ReviewManager by lazy { ReviewManagerFactory.create(reactContext) }
  private val reviewInFlight = AtomicBoolean(false)

  override fun isAvailable(promise: Promise) {
    promise.resolve(isPlayStoreInstalled())
  }

  override fun requestReview(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject(ERROR_NO_ACTIVITY, "No foreground activity to show the review flow on.")
      return
    }
    if (!reviewInFlight.compareAndSet(false, true)) {
      promise.reject(ERROR_IN_PROGRESS, "A review flow is already in progress.")
      return
    }

    reviewManager.requestReviewFlow().addOnCompleteListener { request ->
      if (!request.isSuccessful) {
        reviewInFlight.set(false)
        rejectWithReviewError(promise, request.exception)
        return@addOnCompleteListener
      }
      // Google never reports whether the dialog was shown or a review was left,
      // so completion of the flow is the only signal we get.
      reviewManager.launchReviewFlow(activity, request.result).addOnCompleteListener { launch ->
        reviewInFlight.set(false)
        if (launch.isSuccessful) {
          promise.resolve(null)
        } else {
          rejectWithReviewError(promise, launch.exception)
        }
      }
    }
  }

  override fun openStoreListing(appId: String?, promise: Promise) {
    val packageName = appId?.takeIf { it.isNotBlank() } ?: reactApplicationContext.packageName
    val context = reactApplicationContext.currentActivity ?: reactApplicationContext
    val marketIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName"))
      .setPackage(PLAY_STORE_PACKAGE)
    val webIntent = Intent(
      Intent.ACTION_VIEW,
      Uri.parse("https://play.google.com/store/apps/details?id=$packageName")
    )

    for (intent in listOf(marketIntent, webIntent)) {
      if (context === reactApplicationContext) intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      try {
        context.startActivity(intent)
        promise.resolve(null)
        return
      } catch (_: ActivityNotFoundException) {
        // Fall through to the next intent.
      }
    }
    promise.reject(ERROR_OPEN_URL_FAILED, "No app can open the Play Store listing for $packageName.")
  }

  private fun isPlayStoreInstalled(): Boolean {
    val packageManager = reactApplicationContext.packageManager
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        packageManager.getPackageInfo(PLAY_STORE_PACKAGE, PackageManager.PackageInfoFlags.of(0))
      } else {
        @Suppress("DEPRECATION")
        packageManager.getPackageInfo(PLAY_STORE_PACKAGE, 0)
      }
      true
    } catch (_: PackageManager.NameNotFoundException) {
      false
    }
  }

  private fun rejectWithReviewError(promise: Promise, error: Exception?) {
    val code = when ((error as? ReviewException)?.errorCode) {
      ReviewErrorCode.PLAY_STORE_NOT_FOUND -> ERROR_PLAY_STORE_NOT_FOUND
      ReviewErrorCode.INVALID_REQUEST -> ERROR_INVALID_REQUEST
      ReviewErrorCode.INTERNAL_ERROR -> ERROR_INTERNAL
      else -> ERROR_UNKNOWN
    }
    promise.reject(code, error?.message ?: "The in-app review flow failed.", error)
  }

  companion object {
    const val NAME = NativeInAppReviewSpec.NAME

    private const val PLAY_STORE_PACKAGE = "com.android.vending"

    private const val ERROR_NO_ACTIVITY = "NO_ACTIVITY"
    private const val ERROR_IN_PROGRESS = "REVIEW_IN_PROGRESS"
    private const val ERROR_PLAY_STORE_NOT_FOUND = "PLAY_STORE_NOT_FOUND"
    private const val ERROR_INVALID_REQUEST = "INVALID_REQUEST"
    private const val ERROR_INTERNAL = "INTERNAL_ERROR"
    private const val ERROR_OPEN_URL_FAILED = "OPEN_URL_FAILED"
    private const val ERROR_UNKNOWN = "UNKNOWN"
  }
}
