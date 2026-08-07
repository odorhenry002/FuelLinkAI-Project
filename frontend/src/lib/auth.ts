import apiClient from './api-client';
import { User } from './types';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'buyer' | 'supplier' | 'transporter';
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function loginUser(data: LoginParams): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', data);
  return response.data;
}

export async function registerUser(data: RegisterParams): Promise<any> {
  const response = await apiClient.post('/api/auth/register', data);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/api/auth/me');
  return response.data;
}
