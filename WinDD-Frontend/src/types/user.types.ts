export interface User {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  lastUpdated: string;
}

export interface UserResponse {
  user: User;
}

export interface UsersResponse {
  users: User[];
} 