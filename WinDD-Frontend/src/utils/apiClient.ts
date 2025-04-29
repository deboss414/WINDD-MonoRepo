import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get the correct base URL based on platform
const getBaseUrl = () => {
  // For development
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator
      return 'http://10.0.2.2:3001/api';
    } else if (Platform.OS === 'ios') {
      // iOS simulator or device
      // For iOS simulator, use localhost
      if (Platform.isPad || Platform.isTV) {
        return 'http://localhost:3001/api';
      }
      // For physical iOS devices, use your computer's IP address
      return 'http://192.168.2.40:3001/api';
    }
  }
  
  // Production URL
  return 'https://your-production-api.com/api';
};

// Create axios instance with increased timeout
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // Increased timeout to 15 seconds
});

// Test backend connection
export const pingBackend = async () => {
  try {
    const currentBaseUrl = apiClient.defaults.baseURL; // Get base URL from the instance
    console.log('Testing backend connection...');
    console.log('Connection details:', {
      platform: Platform.OS,
      isDev: __DEV__,
      baseUrl: currentBaseUrl,
      fullUrl: `${currentBaseUrl}/users/health`,
      timestamp: new Date().toISOString(),
    });

    // Use the apiClient instance for the request
    const response = await apiClient.get('/users/health', {
      timeout: 5000,
      validateStatus: null,
    });

    console.log('Backend connection successful:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });

    return true;
  } catch (error: any) {
    const config = error.config || {}; // Ensure config exists
    const responseError = error.response || {}; // Ensure response exists

    console.error('Backend connection failed:', {
      errorType: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      config: {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL, // This might still be undefined if the request failed early
        headers: config.headers,
      },
      response: error.response ? {
        status: responseError.status,
        data: responseError.data,
        headers: responseError.headers,
      } : 'No response received',
    });

    return false;
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Ensure baseURL and url are defined before concatenation
    const baseUrl = config.baseURL || getBaseUrl();
    const url = config.url || '';
    const fullUrl = `${baseUrl}${url}`;

    console.log('Making request:', {
      url: fullUrl,
      method: config.method,
      headers: config.headers,
    });

    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    // Here you might want to map the error to ApiError if needed
    // For now, just log and reject
    return Promise.reject(error);
  }
);

export { apiClient }; 