# Launch Checklist (Phase 10)

## 10.1 App icon + Splash
- [x] Add `assets/images/icon.png`
- [x] Add splash image `assets/images/splash-icon.png`
- [x] Add Android adaptive icon files:
  - [x] `assets/images/android-icon-foreground.png`
  - [x] `assets/images/android-icon-background.png`
  - [x] `assets/images/android-icon-monochrome.png`
- [x] Add `assets/images/favicon.png` (web)
- [ ] Run `npx expo prebuild --clean` (optional) and verify assets picked up

## 10.2 Privacy Policy + Terms
- [x] `PRIVACY_POLICY.md` ready (update support email)
- [x] `TERMS.md` ready (update support email)

## 10.3 Screenshots (Play Store)
- [ ] Take 5–8 screenshots from a real device:
  - [ ] Welcome / Dashboard
  - [ ] Courses list + course detail
  - [ ] Lesson video player
  - [ ] Quiz + result
  - [ ] Investment simulator (portfolio + stock detail)
  - [ ] Leaderboard
  - [ ] Profile + Settings (language)

## 10.4 App description (AR + EN)
- [x] `STORE_LISTING.md` ready (copy/paste)

## 10.5 EAS build (Android)
- [ ] Install EAS CLI: `npm i -g eas-cli`
- [ ] Login: `eas login`
- [ ] Configure: `eas build:configure`
- [ ] Build APK (share): `eas build -p android --profile apk`
- [ ] Build AAB (Play Store): `eas build -p android --profile production`

## 10.6 Play Store submission
- [ ] Create app in Google Play Console
- [ ] Upload AAB from EAS build
- [ ] Fill store listing (from `STORE_LISTING.md`)
- [ ] Upload screenshots
- [ ] Set content rating + privacy policy URL
- [ ] Submit for review

