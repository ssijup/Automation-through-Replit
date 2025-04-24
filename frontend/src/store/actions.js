import { 
  login as loginApi, 
  refreshTokenApi, 
  getCurrentUser,
  getUsers,
  getWarehouses,
  getAnnouncements,
  getRecentAnnouncements
} from '../utils/api';

// Authentication action types
export const AUTH_LOGIN_REQUEST = 'AUTH_LOGIN_REQUEST';
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';
export const AUTH_LOGIN_FAIL = 'AUTH_LOGIN_FAIL';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export const AUTH_REFRESH_REQUEST = 'AUTH_REFRESH_REQUEST';
export const AUTH_REFRESH_SUCCESS = 'AUTH_REFRESH_SUCCESS';
export const AUTH_REFRESH_FAIL = 'AUTH_REFRESH_FAIL';
export const AUTH_USER_LOADED = 'AUTH_USER_LOADED';

// Authentication actions
export const login = (username, password, onSuccess) => async dispatch => {
  try {
    dispatch({ type: AUTH_LOGIN_REQUEST });
    
    const data = await loginApi(username, password);
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    dispatch({ type: AUTH_LOGIN_SUCCESS });
    
    // Load user info
    dispatch(loadUser());
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: AUTH_LOGIN_FAIL,
      payload: error.response?.data?.detail || 'Authentication failed. Please check your credentials.'
    });
  }
};

export const logout = () => dispatch => {
  // Remove tokens from localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  dispatch({ type: AUTH_LOGOUT });
};

export const refreshToken = () => async dispatch => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    dispatch(logout());
    return;
  }
  
  try {
    dispatch({ type: AUTH_REFRESH_REQUEST });
    
    const data = await refreshTokenApi(refreshToken);
    
    localStorage.setItem('access_token', data.access);
    
    dispatch({ type: AUTH_REFRESH_SUCCESS });
    
    // Load user info
    dispatch(loadUser());
  } catch (error) {
    dispatch({
      type: AUTH_REFRESH_FAIL,
      payload: 'Session expired. Please login again.'
    });
    
    dispatch(logout());
  }
};

export const loadUser = () => async dispatch => {
  try {
    const userData = await getCurrentUser();
    dispatch({
      type: AUTH_USER_LOADED,
      payload: userData
    });
  } catch (error) {
    console.error('Error loading user:', error);
  }
};

// Warehouse action creators
export const fetchWarehouses = (page = 1) => async dispatch => {
  try {
    dispatch({ type: 'WAREHOUSE_LIST_REQUEST' });
    
    const warehouseData = await getWarehouses(page);
    
    dispatch({
      type: 'WAREHOUSE_LIST_SUCCESS',
      payload: warehouseData
    });
  } catch (error) {
    dispatch({
      type: 'WAREHOUSE_LIST_FAIL',
      payload: error.response?.data?.detail || 'Failed to fetch warehouses'
    });
  }
};

// Announcement action creators
export const fetchAnnouncements = (page = 1) => async dispatch => {
  try {
    dispatch({ type: 'ANNOUNCEMENT_LIST_REQUEST' });
    
    const announcementData = await getAnnouncements(page);
    
    dispatch({
      type: 'ANNOUNCEMENT_LIST_SUCCESS',
      payload: announcementData
    });
  } catch (error) {
    dispatch({
      type: 'ANNOUNCEMENT_LIST_FAIL',
      payload: error.response?.data?.detail || 'Failed to fetch announcements'
    });
  }
};

export const fetchRecentAnnouncements = (limit = 5) => async dispatch => {
  try {
    dispatch({ type: 'ANNOUNCEMENT_LIST_REQUEST' });
    
    const announcementData = await getRecentAnnouncements(limit);
    
    dispatch({
      type: 'ANNOUNCEMENT_RECENT_SUCCESS',
      payload: announcementData
    });
  } catch (error) {
    dispatch({
      type: 'ANNOUNCEMENT_LIST_FAIL',
      payload: error.response?.data?.detail || 'Failed to fetch recent announcements'
    });
  }
};

// User action creators
export const fetchUsers = (page = 1) => async dispatch => {
  try {
    dispatch({ type: 'USER_LIST_REQUEST' });
    
    const userData = await getUsers(page);
    
    dispatch({
      type: 'USER_LIST_SUCCESS',
      payload: userData
    });
  } catch (error) {
    dispatch({
      type: 'USER_LIST_FAIL',
      payload: error.response?.data?.detail || 'Failed to fetch users'
    });
  }
};