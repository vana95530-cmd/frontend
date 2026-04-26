export interface User {
  user_id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface AdPhoto {
  photo_id: number;
  ad_id: number;
  photo_url: string;
  is_main: boolean;
}

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  ad_id?: number | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface AdminLog {
  log_id: number;
  admin_id: number;
  action_type: string;
  target_type?: string;
  target_id?: number;
  details?: any;
  created_at: string;
}

// Тип для параметрів фільтрації оголошень
export interface AdFilterParams {
  property_type?: string;
  district?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  rooms?: number;
  status?: string; // тільки для адміна
}

export interface AdPhoto {
  photo_id: number;
  url: string;
  is_main: boolean;
}

export interface Advertisement {
  ad_id: number;
  user_id: number;
  title: string;
  description: string;
  property_type: 'apartment' | 'house' | 'commercial' | 'land';
  district: string;
  address?: string;
  price: number;
  area?: number;
  rooms?: number;
  floor?: number;
  total_floors?: number;
  status: 'pending' | 'active' | 'rejected' | 'sold';
  created_at: string;
  updated_at?: string;
  author?: {
    user_id: number;
    full_name: string;
    email: string;
    phone?: string;
  };
  photos: AdPhoto[];
  main_photo?: string; // для списку
}

export interface AdFilterParams {
  property_type?: string;
  district?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  rooms?: number;
}

export interface CreateAdData {
  title: string;
  description: string;
  property_type: string;
  district: string;
  address?: string;
  price: number;
  area?: number;
  rooms?: number;
  floor?: number;
  total_floors?: number;
}

export interface SearchHistoryItem {
  search_id: number;
  query_params: AdFilterParams;
  created_at: string;
}

export interface FavoriteAd {
  ad_id: number;
  title: string;
  price: number;
  district: string;
  main_photo?: string;
  status: string;
}

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatInfo {
  partner_id: number;
  partner_name: string;
  ad_id: number;
  last_message: string;
  last_time: string;
}