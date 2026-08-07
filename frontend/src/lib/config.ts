export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/api/health',
  
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  
  // Companies
  COMPANIES: '/api/companies',
  COMPANY_DETAIL: (id: string) => `/api/companies/${id}`,
  
  // Users
  USERS: '/api/users',
  USER_PROFILE: (id: string) => `/api/users/${id}`,
};
