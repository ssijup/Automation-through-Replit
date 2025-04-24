import axios from 'axios';
import { getTokens, isTokenExpired } from './auth';

// Create an axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the JWT token to requests
api.interceptors.request.use(
  async config => {
    const { accessToken } = getTokens();
    
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const login = async (username, password) => {
  const response = await axios.post('/api/token/', { username, password });
  return response.data;
};

export const refreshTokenApi = async (refresh_token) => {
  const response = await axios.post('/api/token/refresh/', { refresh: refresh_token });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/current-user/');
  return response.data;
};

// User API calls
export const getUsers = async (page = 1, page_size = 10) => {
  const response = await api.get(`/users/?page=${page}&page_size=${page_size}`);
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}/`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}/`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}/`);
  return response.data;
};

export const getUsersCount = async () => {
  const response = await api.get('/users/');
  return response.data.count || 0;
};

// Warehouse API calls
export const getWarehouses = async (page = 1, page_size = 10) => {
  const response = await api.get(`/warehouses/?page=${page}&page_size=${page_size}`);
  return response.data;
};

export const getWarehouse = async (id) => {
  const response = await api.get(`/warehouses/${id}/`);
  return response.data;
};

export const createWarehouse = async (warehouseData) => {
  const response = await api.post('/warehouses/', warehouseData);
  return response.data;
};

export const updateWarehouse = async (id, warehouseData) => {
  const response = await api.put(`/warehouses/${id}/`, warehouseData);
  return response.data;
};

export const deleteWarehouse = async (id) => {
  const response = await api.delete(`/warehouses/${id}/`);
  return response.data;
};

export const getWarehousesCount = async () => {
  const response = await api.get('/warehouses/');
  return response.data.count || 0;
};

// Announcement API calls
export const getAnnouncements = async (page = 1, page_size = 10) => {
  const response = await api.get(`/announcements/?page=${page}&page_size=${page_size}`);
  return response.data;
};

export const getRecentAnnouncements = async (limit = 5) => {
  const response = await api.get(`/announcements/?page=1&page_size=${limit}`);
  return response.data;
};

export const getAnnouncement = async (id) => {
  const response = await api.get(`/announcements/${id}/`);
  return response.data;
};

export const createAnnouncement = async (announcementData) => {
  const response = await api.post('/announcements/', announcementData);
  return response.data;
};

export const updateAnnouncement = async (id, announcementData) => {
  const response = await api.put(`/announcements/${id}/`, announcementData);
  return response.data;
};

export const deleteAnnouncement = async (id) => {
  const response = await api.delete(`/announcements/${id}/`);
  return response.data;
};

export const toggleAnnouncementStatus = async (id, isActive) => {
  const response = await api.patch(`/announcements/${id}/`, { is_active: isActive });
  return response.data;
};