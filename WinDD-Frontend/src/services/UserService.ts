import { api } from '../api/api';

interface UserSearchResponse {
  exists: boolean;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  message?: string;
}

export const searchUserByEmail = async (email: string): Promise<UserSearchResponse> => {
  try {
    const response = await api.post('/users/search', { email });
    return response.data;
  } catch (error) {
    console.error('Error searching for user:', error);
    throw error;
  }
}; 