import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.2.40:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    console.log('Current token:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized access - removing token');
      await AsyncStorage.removeItem('token');
      // Pass through the error message from the backend
      return Promise.reject({
        ...error,
        message: error.response?.data?.error || 'Authentication failed',
        code: error.response?.data?.code || 'AUTH_FAILED'
      });
    }
    // For other errors, pass through the backend error message if available
    return Promise.reject({
      ...error,
      message: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'UNKNOWN_ERROR'
    });
  }
);

export { api }; 