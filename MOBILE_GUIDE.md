# CityLens: Web & Mobile Guide (College Level)

This guide explains how to take your project from a website to a mobile app using the tools already installed in your project.

---

## 1. The Strategy
We use **One Codebase** for everything. 
- **Web:** Runs as a standard React website.
- **Mobile (PWA):** Installs from the browser (no App Store needed).
- **Mobile (Native):** Uses **Capacitor** to create an `.apk` (Android) or iOS app.

---

## 2. Tools You Are Using
1. **React + Vite:** Your web framework.
2. **Capacitor:** The tool that "wraps" your website into a mobile app.
3. **PWA Plugin:** Makes your website behaving like an app on mobile browsers.
4. **Tailwind CSS:** Handles your responsive "Mobile First" design.

---

## 3. How to Development for Mobile
Your project is already set up with **Mobile-First** CSS. When you use Tailwind classes like `p-4 md:p-8`, the standard `p-4` applies to mobile, and `md:p-8` applies to larger screens.

### Testing on your Phone
1. Open the **Shared App URL** on your mobile browser.
2. Tap "Share" (iOS) or "Triple Dots" (Android).
3. Select **"Add to Home Screen"**.
4. The app will now appear on your phone like a real app!

---

## 4. Turning it into an Android App (.apk)
If you want to submit this as a mobile app for college:

### Prerequisites:
- Install [Android Studio](https://developer.android.com/studio) on your personal laptop.

### Implementation Steps (Run these on your local computer):
1. **Download your project code** from AI Studio (Settings -> Export).
2. **Open a terminal** in the project folder.
3. **Build the web version**:
   ```bash
   npm install
   npm run build
   ```
4. **Init Capacitor** (if not already done):
   ```bash
   npx cap init
   ```
5. **Add Android platform**:
   ```bash
   npx cap add android
   ```
6. **Sync the code to Android**:
   ```bash
   npx cap sync
   ```
7. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```
8. **In Android Studio**, click the "Play" button or go to `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

---

## 5. Handling API Keys on Mobile
On the web (in AI Studio), we use `process.env.GEMINI_API_KEY`.
When you move to a local build for a mobile app:
1. Create a `.env` file in your root folder.
2. Add `VITE_GEMINI_API_KEY=your_real_key_here`.
3. Your code in `src/lib/gemini.ts` will automatically detect the `VITE_` Key.

---

## 6. Pro Tips for your Presentation
- **Haptic Feedback:** Notice the `triggerHaptic()` function calls in the code? On a mobile app, these cause real phone vibrations!
- **Location Services:** The app uses real GPS coordinates. When you test it on a phone, it asks for permission just like a real commercial app.
- **Offline Ready:** Because we added the PWA plugin, parts of the app will continue to load even if the user loses internet briefly.
