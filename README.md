# BaziGPT Mobile

A React Native mobile app for BaziGPT - AI-Powered Chinese Astrology & Relationship Compatibility.

## Features

- **Personal Bazi Readings**: Get detailed Chinese astrology readings based on your birth date and time
- **Daily Forecasts**: Receive personalized daily forecasts and insights
- **Compatibility Analysis**: Analyze relationship compatibility between two people
- **Famous Charts**: Explore the Bazi charts of famous personalities
- **Profile Management**: Save your birth information for quick access to personalized features

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Axios** for API calls
- **AsyncStorage** for local data persistence
- **EAS** for building and deployment

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- EAS CLI

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd BaziGPT_mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your device:
   - Install Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

## Building for Production

### Development Build
```bash
eas build --profile development
```

### Production Build
```bash
eas build --profile production
```

### Submit to App Stores
```bash
eas submit --platform all
```

## API Integration

The mobile app connects to the existing BaziGPT backend hosted at `https://bazigpt.io/api`. All API endpoints are configured in `src/services/api.ts`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navigation.tsx   # Main navigation setup
├── screens/            # Screen components
│   ├── HomeScreen.tsx
│   ├── DailyScreen.tsx
│   ├── CompatibilityScreen.tsx
│   ├── FamousScreen.tsx
│   └── ProfileScreen.tsx
├── services/           # API and external services
│   └── api.ts
├── constants/          # App constants and theme
│   └── theme.ts
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Environment Configuration

The app is configured to work with the production BaziGPT API. For development with a local backend, update the `BASE_URL` in `src/services/api.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the same terms as the main BaziGPT project.
