import axios from 'axios';
import { refreshToken } from '../store/actions';
import store from '../store';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        await store.dispatch(refreshToken());
        
        // Get new token
        const token = localStorage.getItem('access_token');
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API functions
export const login = async (username, password) => {
  const response = await api.post('token/', { username, password });
  return response.data;
};

export const refreshTokenApi = async (refresh_token) => {
  const response = await api.post('token/refresh/', { refresh: refresh_token });
  return response.data;
};

// User API functions
export const getCurrentUser = async () => {
  const response = await api.get('users/me/');
  return response.data;
};

export const getUsers = async (page = 1, page_size = 10) => {
  const response = await api.get(`users/?page=${page}&page_size=${page_size}`);
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(`users/${id}/`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('users/create/', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`users/${id}/`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`users/${id}/`);
  return response.data;
};

export const getUsersCount = async () => {
  const response = await api.get('users/');
  return response.data;
};

// Warehouse API functions
export const getWarehouses = async (page = 1, page_size = 10) => {
  const response = await api.get(`warehouses/?page=${page}&page_size=${page_size}`);
  return response.data;
};

export const getWarehouse = async (id) => {
  const response = await api.get(`warehouses/${id}/`);
  return response.data;
};

export const createWarehouse = async (warehouseData) => {
  const response = await api.post('warehouses/', warehouseData);
  return response.data;
};

export const updateWarehouse = async (id, warehouseData) => {
  const response = await api.put(`warehouses/${id}/`, warehouseData);
  return response.data;
};

export const deleteWarehouse = async (id) => {
  const response = await api.delete(`warehouses/${id}/`);
  return response.data;
};

export const getWarehousesCount = async () => {
  const response = await api.get('warehouses/');
  return response.data;
};

// Announcement API functions
export const getAnnouncements = async (page = 1, page_size = 10) => {
  const response = await api.get(`announcements/?page=${page}&page_size=${page_size}`);
  return response.data;
};

export const getRecentAnnouncements = async (limit = 5) => {
  const response = await api.get(`announcements/?page=1&page_size=${limit}`);
  return response.data;
};

export const getAnnouncement = async (id) => {
  const response = await api.get(`announcements/${id}/`);
  return response.data;
};

export const createAnnouncement = async (announcementData) => {
  const response = await api.post('announcements/', announcementData);
  return response.data;
};

export const updateAnnouncement = async (id, announcementData) => {
  const response = await api.put(`announcements/${id}/`, announcementData);
  return response.data;
};

export const deleteAnnouncement = async (id) => {
  const response = await api.delete(`announcements/${id}/`);
  return response.data;
};

export const toggleAnnouncementStatus = async (id, isActive) => {
  const announcement = await getAnnouncement(id);
  announcement.is_active = isActive;
  const response = await updateAnnouncement(id, announcement);
  return response.data;
};

export default api;
