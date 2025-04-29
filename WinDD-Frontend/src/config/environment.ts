import { Platform } from 'react-native';

interface Environment {
  API_BASE_URL: string;
  ENV: 'development' | 'production' | 'test';
}

// Get the correct base URL based on platform
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-production-api.com/api';
  }

  // For development
  if (Platform.OS === 'android') {
    // Android emulator
    return 'http://10.0.2.2:3001/api';
  } else if (Platform.OS === 'ios') {
    // iOS simulator or device
    return 'http://192.168.2.40:3001/api';
  }

  // Default to local IP
  return 'http://192.168.2.40:3001/api';
};

const development: Environment = {
  API_BASE_URL: getBaseUrl(),
  ENV: 'development',
};

const production: Environment = {
  API_BASE_URL: 'https://your-production-api.com/api',
  ENV: 'production',
};

const getEnvironment = (): Environment => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return production;
    case 'test':
      return development;
    default:
      return development;
  }
};

export const env = getEnvironment(); 