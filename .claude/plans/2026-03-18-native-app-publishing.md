# Publish DEJA.js Throttle App to App Store and Google Play

## Overview

DEJA.js Throttle is a Vue 3 app wrapped in Capacitor. The web build deploys to Vercel;
the native builds (iOS + Android) are distributed through the App Store and Google Play.

---

## Part A — Developer Account Setup

### Apple Developer Program

**Cost:** $99 USD/year
**URL:** https://developer.apple.com/programs/enroll/

1. Sign in with your Apple ID at https://developer.apple.com
2. Click "Enroll" → choose "Individual" (or "Organization" if publishing under a company)
3. Agree to the Apple Developer Agreement
4. Pay $99/year
5. Wait for approval (usually instant for individuals, 1–5 days for organizations)

**What you get:**
- App Store Connect access (app submissions, TestFlight)
- Xcode signing certificates and provisioning profiles
- Up to 100 TestFlight external testers
- Access to Apple Silicon native tools

**Claude Code task — iOS signing setup:**
```
Set up iOS code signing for the DEJA.js Throttle Capacitor app.

1. Open Xcode → apps/throttle/ios/App/App.xcworkspace
2. Select the App target → Signing & Capabilities
3. Set Team to your Apple Developer team
4. Enable "Automatically manage signing"
5. Verify bundle ID matches: com.dejajs.throttle (or your chosen ID)
6. Update apps/throttle/capacitor.config.ts appId to match
7. Create an App Store Connect app entry at https://appstoreconnect.apple.com
8. Set app name, category (Entertainment or Utilities), primary language
9. Upload screenshots and metadata (see Part C)
```

### Google Play Developer Account

**Cost:** $25 USD one-time
**URL:** https://play.google.com/console/signup

1. Sign in with a Google account (use a dedicated business account if possible)
2. Accept the Developer Distribution Agreement
3. Pay $25 one-time registration fee
4. Complete account details (developer name, contact email, website)

**Claude Code task — Android signing setup:**
```
Set up Android signing for the DEJA.js Throttle Capacitor app.

1. Generate a release keystore (keep this file SAFE — losing it means you cannot
   update your app):

   keytool -genkey -v -keystore deja-throttle-release.keystore \
     -alias deja-throttle \
     -keyalg RSA -keysize 2048 -validity 10000

2. Store the keystore at a SECURE location outside the repo (e.g. ~/.deja/signing/)
3. Add signing config to apps/throttle/android/app/build.gradle:

   android {
     signingConfigs {
       release {
         storeFile file(System.getenv("DEJA_KEYSTORE_PATH"))
         storePassword System.getenv("DEJA_KEYSTORE_PASSWORD")
         keyAlias "deja-throttle"
         keyPassword System.getenv("DEJA_KEY_PASSWORD")
       }
     }
     buildTypes {
       release {
         signingConfig signingConfigs.release
         minifyEnabled true
         proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
       }
     }
   }

4. Set environment variables in CI and local .env:
   DEJA_KEYSTORE_PATH, DEJA_KEYSTORE_PASSWORD, DEJA_KEY_PASSWORD

5. Create a Google Play app at https://play.google.com/console
6. Choose app name: "DEJA Throttle" — category: Entertainment
7. Complete content rating questionnaire
8. Set up Internal Testing track first for initial upload
```

---

## Part B — App Metadata & Store Listings

### App Store (iOS)

| Field | Value |
|---|---|
| App Name | DEJA Throttle |
| Subtitle | Model Railroad Control |
| Category | Entertainment (or Utilities) |
| Bundle ID | com.dejajs.throttle |
| Privacy Policy URL | Required — create at dejajs.com/privacy |

**Screenshots required:**
- iPhone 6.9" (iPhone 16 Pro Max): 1320 × 2868
- iPhone 6.5" (iPhone 14 Plus): 1284 × 2778
- iPad Pro 12.9": 2048 × 2732

**Claude Code task — capture App Store screenshots:**
```
Capture App Store screenshots for DEJA Throttle.
Use the Simulator (iOS) and the capture-screenshots skill.

Required views to capture:
1. Throttle control view (active loco with speed slider)
2. Roster view (list of locos)
3. Turnouts view
4. Settings view (WiThrottle connection)
5. Connect/layout selection view

Save to: apps/throttle/store-assets/ios/
```

### Google Play (Android)

| Field | Value |
|---|---|
| App Name | DEJA Throttle |
| Short Description | ≤80 chars |
| Full Description | ≤4000 chars |
| Category | Entertainment |
| Package Name | com.dejajs.throttle |

**Screenshots required:**
- Phone: 16:9 or 9:16, min 320px, max 3840px (at least 2)
- Tablet 7": optional but recommended
- Feature graphic: 1024 × 500

---

## Part C — Build and Release Workflow

### Manual Build (first release)

```bash
# iOS
cd apps/throttle
pnpm build
npx cap sync ios
npx cap open ios   # Opens Xcode
# In Xcode: Product → Archive → Distribute App → App Store Connect

# Android
pnpm build
npx cap sync android
npx cap open android   # Opens Android Studio
# In Android Studio: Build → Generate Signed Bundle/APK → Android App Bundle
# Upload .aab to Google Play Console
```

### CI/CD with Fastlane (recommended for ongoing releases)

**Claude Code task — set up Fastlane:**
```
Set up Fastlane for automated iOS and Android builds and releases for DEJA Throttle.

1. Install Fastlane: gem install fastlane
2. cd apps/throttle/ios && fastlane init
   - Choose "Automate App Store distribution"
   - Follow prompts to configure app identifier and Apple ID
3. cd apps/throttle/android && fastlane init
   - Choose "Automate deployment to Google Play"
4. Create Fastfile lanes:
   - ios lane: increment_build_number, build_app, upload_to_testflight
   - android lane: increment_version_code, gradle(task: "bundle"), upload_to_play_store(track: "internal")
5. Add GitHub Actions workflow at .github/workflows/native-release.yml:
   - Trigger: push to main (or manual dispatch)
   - Steps: checkout, pnpm install, pnpm build (throttle), cap sync, fastlane
6. Store secrets in GitHub: APPLE_ID, APP_SPECIFIC_PASSWORD, GOOGLE_PLAY_JSON_KEY,
   DEJA_KEYSTORE_PATH, DEJA_KEYSTORE_PASSWORD, DEJA_KEY_PASSWORD
```

### GitHub Actions workflow structure

```yaml
# .github/workflows/native-release.yml
name: Native App Release
on:
  workflow_dispatch:
    inputs:
      platform:
        type: choice
        options: [ios, android, both]
jobs:
  build-ios:
    if: inputs.platform == 'ios' || inputs.platform == 'both'
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm --filter=deja-throttle build
      - run: npx cap sync ios
      - run: cd apps/throttle && fastlane ios release
  build-android:
    if: inputs.platform == 'android' || inputs.platform == 'both'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install
      - run: pnpm --filter=deja-throttle build
      - run: npx cap sync android
      - run: cd apps/throttle && fastlane android release
```

---

## Part D — App Review Notes

### Apple App Review
- Model railroad apps are typically approved under Entertainment
- Ensure the app works without an active WiThrottle server (show clear onboarding/error state)
- Local network permission prompt must include a clear description (already in Info.plist plan)
- Privacy policy URL is required at time of submission

### Google Play Review
- First app review takes 1–7 days; subsequent updates are usually 24–48 hours
- Ensure app targets recent API level (Android 14 / API 34+ required as of 2025)
- Content rating questionnaire: select "Not designed for children" and appropriate content

---

## Checklist Before First Submission

**Accounts**
- [ ] Apple Developer Program enrolled and paid
- [ ] Google Play Developer account created and paid
- [ ] App entries created in App Store Connect and Play Console

**Signing**
- [ ] iOS: bundle ID set, automatic signing configured in Xcode
- [ ] Android: release keystore generated and stored securely
- [ ] Keystore backed up in at least 2 secure locations (losing it = can't update app)

**App Content**
- [ ] Privacy policy published at dejajs.com/privacy
- [ ] App icon: 1024×1024 (iOS), 512×512 (Android)
- [ ] Screenshots captured for all required screen sizes
- [ ] App description written (< 4000 chars)

**Technical**
- [ ] Capacitor upgraded to v7
- [ ] WiThrottle native support working (see `2026-03-18-withrottle-native-activation.md`)
- [ ] Local network permission prompt working on iOS
- [ ] Android network permissions set
- [ ] Build runs clean with no warnings in Xcode / Android Studio
- [ ] App tested on real devices (not just simulators)

**First Release Strategy**
- [ ] iOS: Upload to TestFlight first → invite 5–10 beta testers → gather feedback → submit for App Review
- [ ] Android: Upload to Internal Testing track → promote to Open Testing → promote to Production
