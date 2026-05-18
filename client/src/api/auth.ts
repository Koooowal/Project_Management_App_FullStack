import { apiClient } from './client';

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterInput = {
  email: string;
  name: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  user: SafeUser;
};

export async function registerUser(data: RegisterInput): Promise<{ user: SafeUser }> {
  const res = await apiClient.post<{ user: SafeUser }>('/auth/register', data);
  return res.data;
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', data);
  return res.data;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post('/auth/logout');
}
