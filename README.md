# 🎮 Fin-Game

> Egypt's gamified financial literacy app for Gen Z.
> **Game → Learn → Earn**

A React Native + Expo mobile app that teaches young Egyptians financial skills through interactive courses, simulations, and a real financial product marketplace.

---

## 📱 Tech Stack

- **Framework**: [Expo SDK 54](https://expo.dev) (React Native 0.81)
- **Language**: TypeScript
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (file-based)
- **Styling**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for RN)
- **UI Components**: [React Native Paper](https://callstack.github.io/react-native-paper/)
- **Icons**: [Lucide](https://lucide.dev)
- **State**: [Zustand](https://github.com/pmndrs/zustand) (upcoming)
- **Backend**: [Supabase](https://supabase.com) (upcoming)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (tested with v22.22.0)
- npm 10+
- Expo Go app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Install & Run
```bash
npm install
npx expo start --lan
```

Then on your phone:
1. Open **Expo Go**
2. Enter URL manually: `exp://<your-computer-ip>:8081`
   (or scan the QR code)

> **Tip**: Computer and phone must be on the same WiFi.

---

## 📁 Project Structure

```
Fin-Game/
├── app/                      # Expo Router screens
│   ├── _layout.tsx           # Root layout with providers
│   ├── index.tsx             # Welcome screen
│   └── dashboard.tsx         # Main dashboard
├── components/
│   └── ui/                   # Reusable UI components
├── theme/                    # Design tokens (colors, typography)
├── lib/                      # Utilities (formatters, helpers)
├── assets/                   # Images, fonts
├── legacy-web/               # Original Figma-generated web code (reference)
├── guidelines/               # Project guidelines
├── app.json                  # Expo config
├── tailwind.config.js        # NativeWind theme
└── ROADMAP.md                # Development roadmap & progress
```

---

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full development plan and current progress.

---

## 📝 License

Proprietary — Pentavalue / Fin-Game
