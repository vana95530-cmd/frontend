import apiClient from '../api/client';

export interface PendingAd {
  ad_id: number;
  user_id: number;
  title: string;
  price: number;
  district: string;
  status: string;
  created_at: string;
  main_photo?: string;
}

export interface UserForAdmin {
  user_id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
}

export interface AdminLogEntry {
  log_id: number;
  admin_id: number;
  action_type: string;
  target_type: string;
  target_id: number;
  details: any;
  created_at: string;
}

export interface ReportItem {
  report_id: number;
  reporter_id: number;
  target_type: string;
  target_id: number;
  reason: string;
  status: string;
  created_at: string;
}

export const adminService = {
  async getPendingAds(): Promise<PendingAd[]> {
    const response = await apiClient.get('/admin/ads/pending');
    return response.data;
  },
  async approveAd(adId: number) {
    const response = await apiClient.put(`/admin/ads/${adId}/approve`);
    return response.data;
  },
  async rejectAd(adId: number, reason?: string) {
    const response = await apiClient.put(`/admin/ads/${adId}/reject`, { reason });
    return response.data;
  },
  async getUsers(search?: string, status?: string): Promise<UserForAdmin[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const response = await apiClient.get(`/admin/users?${params.toString()}`);
    return response.data;
  },
  async blockUser(userId: number) {
    const response = await apiClient.put(`/admin/users/${userId}/block`);
    return response.data;
  },
  async unblockUser(userId: number) {
    const response = await apiClient.put(`/admin/users/${userId}/unblock`);
    return response.data;
  },
  async getLogs(): Promise<AdminLogEntry[]> {
    const response = await apiClient.get('/admin/logs');
    return response.data;
  },
  async getReports(): Promise<ReportItem[]> {
    const response = await apiClient.get('/admin/reports');
    return response.data;
  }
};