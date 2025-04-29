export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  displayName: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  lastUpdated: string;
}

export interface UserResponse {
  user: User;
} 