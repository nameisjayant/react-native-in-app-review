#import "InAppReview.h"

#import <StoreKit/StoreKit.h>
#import <UIKit/UIKit.h>

static NSString *const kErrorNoWindowScene = @"NO_WINDOW_SCENE";
static NSString *const kErrorMissingAppId = @"MISSING_APP_ID";
static NSString *const kErrorOpenUrlFailed = @"OPEN_URL_FAILED";

@implementation InAppReview

- (void)isAvailable:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
  // SKStoreReviewController ships with every iOS version React Native supports.
  resolve(@YES);
}

- (void)requestReview:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIWindowScene *scene = [InAppReview activeWindowScene];
    if (scene == nil) {
      reject(kErrorNoWindowScene, @"No foreground window scene to show the review prompt in.", nil);
      return;
    }
    // StoreKit decides whether the prompt actually appears (max 3 times per 365 days)
    // and never reports back, so resolving means the request was made.
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    [SKStoreReviewController requestReviewInScene:scene];
#pragma clang diagnostic pop
    resolve(nil);
  });
}

- (void)openStoreListing:(NSString *)appId
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject
{
  NSString *trimmed = [appId stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
  NSCharacterSet *nonDigits = [[NSCharacterSet decimalDigitCharacterSet] invertedSet];
  if (trimmed.length == 0 || [trimmed rangeOfCharacterFromSet:nonDigits].location != NSNotFound) {
    reject(kErrorMissingAppId, @"A numeric App Store ID (iosAppId) is required to open the review page on iOS.", nil);
    return;
  }

  NSString *urlString = [NSString stringWithFormat:@"https://apps.apple.com/app/id%@?action=write-review", trimmed];
  NSURL *url = [NSURL URLWithString:urlString];
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] openURL:url
                                       options:@{}
                             completionHandler:^(BOOL success) {
      if (success) {
        resolve(nil);
      } else {
        reject(kErrorOpenUrlFailed, @"Could not open the App Store review page.", nil);
      }
    }];
  });
}

+ (UIWindowScene *)activeWindowScene
{
  UIWindowScene *fallback = nil;
  for (UIScene *scene in [UIApplication sharedApplication].connectedScenes) {
    if (![scene isKindOfClass:[UIWindowScene class]]) {
      continue;
    }
    if (scene.activationState == UISceneActivationStateForegroundActive) {
      return (UIWindowScene *)scene;
    }
    if (fallback == nil && scene.activationState == UISceneActivationStateForegroundInactive) {
      fallback = (UIWindowScene *)scene;
    }
  }
  return fallback;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeInAppReviewSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"InAppReview";
}

@end
