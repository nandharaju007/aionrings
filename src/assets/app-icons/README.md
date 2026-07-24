# aiOn App Icon Submission Package

This package contains everything needed to submit the aiOn icon to the Apple App Store and Google Play Store.

## What's included

- `ios/AppIcon.appiconset/` — Xcode asset catalog with all required iPhone/iPad/App Store sizes.
- `android/mipmap-*/` — Launcher icons for every density, plus adaptive foreground/background layers.
- `android/play-store/icon-512.png` — Google Play Store listing icon.
- `web/` — Favicon, Apple touch icon, and PWA icons for the website.

## iOS

1. Open your Xcode project.
2. In the Project navigator, select `Assets.xcassets`.
3. Delete the existing `AppIcon` set if present.
4. Right-click `Assets.xcassets` → **Show in Finder**.
5. Copy the `AppIcon.appiconset` folder from this package into `Assets.xcassets`.
6. Return to Xcode — the icon set will appear automatically.

**App Store Connect requirements**
- Marketing icon: `icon-1024-marketing.png` (1024×1024 px, no alpha, no rounded corners — Apple applies the mask).
- All other sizes are generated automatically by Xcode from the catalog.

## Android

1. Copy the `mipmap-*` folders into your Android project under `app/src/main/res/`.
2. For **adaptive icons** (API 26+), create `res/mipmap-anydpi-v26/ic_launcher.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
```

3. Reference `ic_launcher` in your manifest:

```xml
<application
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    ... />
```

**Google Play requirements**
- Store listing icon: `play-store/icon-512.png` (512×512 px).
- Adaptive foreground/background are provided at 432×432 px (xxxhdpi).

## Notes

- The source master file is `aion-app-icon-source.png` (1024×1024 px).
- The foreground layer is `aion-app-icon-foreground.png` for Android adaptive icons.
- Background color: `#0A1628` (midnight navy).
- Keep the icon free of extra text, badges, or seasonal imagery for store submission.
