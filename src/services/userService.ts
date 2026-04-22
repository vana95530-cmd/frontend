import apiClient from '../api/client';
import type { Advertisement, SearchHistoryItem, FavoriteAd } from '../types';

export const userService = {
  // Профіль
  async updateProfile(data: { full_name?: string; phone?: string }) {
    const response = await apiClient.put('/user/me', data);
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await apiClient.post('/user/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Мої оголошення
  async getMyAds(): Promise<Advertisement[]> {
    const response = await apiClient.get('/user/ads');
    return response.data;
  },

  // Історія пошуку
  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    const response = await apiClient.get('/user/search-history');
    return response.data;
  },

  async saveSearchHistory(params: any) {
    await apiClient.post('/user/search-history', params);
  },

  // Обране
  async getFavorites(): Promise<FavoriteAd[]> {
    const response = await apiClient.get('/user/favorites');
    return response.data;
  },

  async addToFavorites(adId: number) {
    await apiClient.post(`/user/favorites/${adId}`);
  },

  async removeFromFavorites(adId: number) {
    await apiClient.delete(`/user/favorites/${adId}`);
  },
};