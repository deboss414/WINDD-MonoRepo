import { api } from '../../api/api';

export abstract class BaseService {
  protected readonly api = api;
  protected readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.api.get<T>(`${this.baseUrl}${endpoint}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error in GET ${endpoint}:`, error);
      throw error;
    }
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post<T>(`${this.baseUrl}${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error in POST ${endpoint}:`, error);
      throw error;
    }
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put<T>(`${this.baseUrl}${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error in PUT ${endpoint}:`, error);
      throw error;
    }
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.api.delete<T>(`${this.baseUrl}${endpoint}`);
      return response.data;
    } catch (error) {
      console.error(`Error in DELETE ${endpoint}:`, error);
      throw error;
    }
  }
} 