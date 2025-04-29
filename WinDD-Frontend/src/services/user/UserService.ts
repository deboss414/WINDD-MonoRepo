import { BaseService } from '../base/BaseService';
import { User } from '../../types/user.types';
import { AuthResponse } from '../../types/auth.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class UserService extends BaseService {
  private static instance: UserService;
  private currentUser: User | null = null;

  private constructor() {
    super('/auth');
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>('/login', { email, password });
      this.currentUser = response.user;
      // Store the token in AsyncStorage
      await AsyncStorage.setItem('token', response.token);
      console.log('Token stored after login');
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>('/register', {
        email,
        password,
        firstName,
        lastName,
      });
      this.currentUser = response.user;
      // Store the token in AsyncStorage
      await AsyncStorage.setItem('token', response.token);
      console.log('Token stored after registration');
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.post<void>('/logout');
      this.currentUser = null;
      // Remove the token from AsyncStorage
      await AsyncStorage.removeItem('token');
      console.log('Token removed after logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public async getProfile(): Promise<User> {
    try {
      const response = await this.get<User>('/me');
      this.currentUser = response;
      return response;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  public async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await this.put<User>('/me', updates);
      this.currentUser = response;
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
} 