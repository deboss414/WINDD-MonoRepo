import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UserService } from '../services/user/UserService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const userService = UserService.getInstance();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await userService.login(email, password);
      context.setUser(response.user);
      context.setToken(response.token);
      await AsyncStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleSignup = async (
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ) => {
    try {
      const response = await userService.register(email, password, firstName, lastName);
      context.setUser(response.user);
      context.setToken(response.token);
      await AsyncStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      context.setUser(null);
      context.setToken(null);
    } catch (error) {
      throw error;
    }
  };

  return {
    user: context.user,
    token: context.token,
    isAuthenticated: !!context.user,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
  };
}; 