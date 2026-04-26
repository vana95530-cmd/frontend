import apiClient from '../api/client';
import type { Message, ChatInfo } from '../types';

let adminId: number | null = null;

export const chatService = {
    async getAdminInfo(): Promise<{ user_id: number; email: string; full_name: string }> {
        const response = await apiClient.get('/chat/admin-info');
        adminId = response.data.user_id;
        return response.data;
    },

    async getAdminId(): Promise<number> {
        if (adminId) return adminId;
        const info = await this.getAdminInfo();
        return info.user_id;
    },

    async getMessages(partnerId: number, adId: number): Promise<Message[]> {
        const response = await apiClient.get(`/chat?partner_id=${partnerId}&ad_id=${adId}`);
        return response.data;
    },

    async sendMessage(receiverId: number, adId: number, content: string): Promise<Message> {
        const response = await apiClient.post('/chat', {
            receiver_id: receiverId,
            ad_id: adId,
            content,
        });
        return response.data;
    },

    async markAsRead(messageId: number): Promise<void> {
        await apiClient.put(`/chat/${messageId}/read`);
    },

    async getChats(): Promise<ChatInfo[]> {
        const response = await apiClient.get('/chat');
        return response.data;
    },
};