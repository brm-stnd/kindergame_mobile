# KinderGame Mobile App

Mobile app for KinderGame - Educational games platform for children aged 3-6 years.

Built with **Expo** (React Native).

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI for builds (`npm install -g eas-cli`)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

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
   
   Create `.env` file if you need custom API URL:
   ```
   API_URL=https://kindergame.id
   ```

## Running (Development)

### Expo Go (Recommended for development)

```bash
npm start
# or
expo start
```

Scan QR code with:
- **Android**: Expo Go app from Play Store
- **iOS**: Camera app or Expo Go from App Store

### Android Emulator

```bash
npm run android
# or
expo start --android
```

### iOS Simulator (macOS only)

```bash
npm run ios
# or
expo start --ios
```

### Web Browser

```bash
npm run web
# or
expo start --web
```

## Building (Production)

### Login to EAS

```bash
eas login
```

### Build Android APK (for testing)

```bash
eas build --platform android --profile preview
```

Output: APK file that can be installed directly.

### Build Android AAB (for Play Store)

```bash
eas build --platform android --profile production
```

Output: AAB file for upload to Google Play Console.

### Build iOS (for App Store)

```bash
eas build --platform ios --profile production
```

Requires Apple Developer account ($99/year).

### Build both platforms

```bash
eas build --platform all --profile production
```

## Build Profiles

| Profile | Platform | Output | Use Case |
|---------|----------|--------|----------|
| `development` | All | Dev client | Development with hot reload |
| `preview` | Android | APK | Internal testing |
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
    │   └── growth/      # Child growth tracking screens
    └── games/           # Native game components
```

## API

The app connects to KinderGame backend:
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
