# KinderGame Mobile App

Aplikasi mobile KinderGame - Platform game edukasi untuk anak usia 3-6 tahun.

Built with **Expo** (React Native).

## Prerequisites

- Node.js 18+ 
- npm atau yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI untuk build (`npm install -g eas-cli`)
- Android Studio (untuk Android emulator) atau Xcode (untuk iOS simulator)

## Setup

1. **Clone repository**
   ```bash
   git clone git@github.com:brm-stnd/kindergame_mobile.git
   cd kindergame_mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment** (optional)
   
   Buat file `.env` jika perlu konfigurasi API URL:
   ```
   API_URL=https://kindergame.id
   ```

## Running (Development)

### Expo Go (Recommended untuk development)

```bash
npm start
# atau
expo start
```

Scan QR code dengan:
- **Android**: Expo Go app dari Play Store
- **iOS**: Camera app atau Expo Go dari App Store

### Android Emulator

```bash
npm run android
# atau
expo start --android
```

### iOS Simulator (macOS only)

```bash
npm run ios
# atau
expo start --ios
```

### Web Browser

```bash
npm run web
# atau
expo start --web
```

## Building (Production)

### Login ke EAS

```bash
eas login
```

### Build Android APK (untuk testing)

```bash
eas build --platform android --profile preview
```

Output: APK file yang bisa di-install langsung.

### Build Android AAB (untuk Play Store)

```bash
eas build --platform android --profile production
```

Output: AAB file untuk upload ke Google Play Console.

### Build iOS (untuk App Store)

```bash
eas build --platform ios --profile production
```

Butuh Apple Developer account ($99/year).

### Build keduanya sekaligus

```bash
eas build --platform all --profile production
```

## Build Profiles

| Profile | Platform | Output | Kegunaan |
|---------|----------|--------|----------|
| `development` | All | Dev client | Development dengan hot reload |
| `preview` | Android | APK | Testing internal |
| `production` | Android | AAB | Play Store |
| `production` | iOS | IPA | App Store |

## Project Structure

```
kindergame_mobile/
├── App.tsx              # Entry point
├── app.json             # Expo config
├── eas.json             # EAS Build config
├── package.json
├── assets/
│   ├── images/          # App images & icons
│   └── ...
└── src/
    ├── components/      # Reusable components
    ├── contexts/        # React contexts (Auth, etc)
    ├── screens/         # Screen components
    │   ├── HomeScreen.tsx
    │   ├── GamesScreen.tsx
    │   ├── ProfileScreen.tsx
    │   └── growth/      # Tumbuh kembang screens
    └── games/           # Native game components
```

## API

Aplikasi terhubung ke backend KinderGame:
- **Production**: `https://kindergame.id/api`
- **Staging**: `https://staging.kindergame.id/api`

## Troubleshooting

### Metro bundler stuck
```bash
expo start --clear
```

### Dependency issues
```bash
rm -rf node_modules
npm install
```

### EAS build failed
```bash
eas build --platform android --profile preview --clear-cache
```

## Links

- **Web App**: https://kindergame.id
- **Staging**: https://staging.kindergame.id
- **Backend Repo**: https://github.com/brm-stnd/kindergame

## License

Private - KinderGame.id
