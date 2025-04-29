import { User, UserResponse, UsersResponse } from '../types/user.types';
import { api } from './api';
import { AuthResponse } from '../types/auth.types';

class UserApi {
  private readonly baseUrl = '/auth';

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`${this.baseUrl}/login`, {
      email,
      password,
    });
    return response.data;
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`${this.baseUrl}/register`, {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post(`${this.baseUrl}/logout`);
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>(`${this.baseUrl}/me`);
    return response.data;
  }

  async lookupUserByEmail(email: string): Promise<UserResponse> {
    try {
      const response = await api.post<UserResponse>('/users/search', { email });
      return response.data;
    } catch (error) {
      console.error('Error looking up user:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<UserResponse> {
    try {
      const response = await api.get<UserResponse>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUsers(): Promise<UsersResponse> {
    try {
      const response = await api.get<UsersResponse>('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<UserResponse> {
    try {
      const response = await api.put<UserResponse>('/users/me', updates);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { email });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/auth/update-password', { currentPassword, newPassword });
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async deleteAccount(password: string): Promise<void> {
    try {
      await api.delete('/users/me', { data: { password } });
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
}

export const userApi = new UserApi();
