# WinDD

A React Native mobile application built with Expo and TypeScript.

## Project Structure

```
WinDD/
├── assets/
│   └── images/
├── src/
│   ├── api/          # API integration and services
│   ├── components/   # Reusable components
│   │   └── common/   # Shared components
│   ├── contexts/     # React Context providers
│   ├── hooks/        # Custom React hooks
│   ├── navigation/   # Navigation configuration
│   ├── screens/      # Application screens
│   │   └── auth/     # Authentication screens
│   ├── utils/        # Utility functions
│   └── constants/    # Application constants
```

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Dependencies

- React Navigation
- Axios
- AsyncStorage
- TypeScript 