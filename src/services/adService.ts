import apiClient from '../api/client';
import type { Advertisement, AdFilterParams, CreateAdData } from '../types';

export const adService = {
  // Отримання списку активних оголошень із фільтрацією
  async getAds(filters: AdFilterParams = {}): Promise<Advertisement[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await apiClient.get(`/ads?${params.toString()}`);
    return response.data;
  },

  // Отримання одного оголошення за ID
  async getAdById(id: number): Promise<Advertisement> {
    const response = await apiClient.get(`/ads/${id}`);
    return response.data;
  },

  // Створення нового оголошення
  async createAd(data: CreateAdData): Promise<{ ad_id: number; message: string }> {
    const response = await apiClient.post('/ads', data);
    return response.data;
  },

  // Оновлення оголошення
  async updateAd(id: number, data: Partial<CreateAdData>): Promise<{ message: string }> {
    const response = await apiClient.put(`/ads/${id}`, data);
    return response.data;
  },

  // Видалення оголошення
  async deleteAd(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/ads/${id}`);
    return response.data;
  },

  // Завантаження фото
  async uploadPhoto(adId: number, file: File, isMain: boolean = false): Promise<{ photo_id: number; url: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('is_main', String(isMain));
    const response = await apiClient.post(`/ads/${adId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};