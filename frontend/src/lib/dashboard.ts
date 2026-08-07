import apiClient from './api-client';

export interface DashboardOverviewResponse {
  message: string;
  role: string;
  resources: string[];
}

export interface AdminDashboardResponse {
  message: string;
  admin_actions: string[];
}

export interface SupplierDashboardResponse {
  message: string;
  supplier_actions: string[];
}

export interface TransporterDashboardResponse {
  message: string;
  transporter_actions: string[];
}

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  const response = await apiClient.get<DashboardOverviewResponse>('/api/dashboard/overview');
  return response.data;
}

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response = await apiClient.get<AdminDashboardResponse>('/api/dashboard/admin');
  return response.data;
}

export async function getSupplierDashboard(): Promise<SupplierDashboardResponse> {
  const response = await apiClient.get<SupplierDashboardResponse>('/api/dashboard/supplier');
  return response.data;
}

export async function getTransporterDashboard(): Promise<TransporterDashboardResponse> {
  const response = await apiClient.get<TransporterDashboardResponse>('/api/dashboard/transporter');
  return response.data;
}
