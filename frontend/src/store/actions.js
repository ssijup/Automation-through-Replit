import { 
  login as loginApi, 
  refreshTokenApi,
  getCurrentUser
} from '../utils/api';
import { 
  setTokens, 
  removeTokens, 
  getTokens 
} from '../utils/auth';

// Action Types
export const AUTH_LOGIN_REQUEST = 'AUTH_LOGIN_REQUEST';
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';
export const AUTH_LOGIN_FAIL = 'AUTH_LOGIN_FAIL';

export const AUTH_LOGOUT = 'AUTH_LOGOUT';

export const AUTH_REFRESH_REQUEST = 'AUTH_REFRESH_REQUEST';
export const AUTH_REFRESH_SUCCESS = 'AUTH_REFRESH_SUCCESS';
export const AUTH_REFRESH_FAIL = 'AUTH_REFRESH_FAIL';

export const AUTH_USER_LOADED = 'AUTH_USER_LOADED';

// Action Creators

// Login user
export const login = (username, password, onSuccess) => async dispatch => {
  try {
    dispatch({ type: AUTH_LOGIN_REQUEST });

    // Login and get tokens
    const { access, refresh } = await loginApi(username, password);
    
    // Save tokens
    setTokens(access, refresh);
    
    // Get user info
    const user = await getCurrentUser();
    
    dispatch({ 
      type: AUTH_LOGIN_SUCCESS,
      payload: user
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: AUTH_LOGIN_FAIL,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : 'Invalid username or password'
    });
  }
};

// Logout user
export const logout = () => dispatch => {
  removeTokens();
  dispatch({ type: AUTH_LOGOUT });
};

// Refresh token
export const refreshToken = () => async dispatch => {
  try {
    dispatch({ type: AUTH_REFRESH_REQUEST });
    
    const { refreshToken } = getTokens();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const { access } = await refreshTokenApi(refreshToken);
    
    // Only update the access token, keep the refresh token
    localStorage.setItem('access_token', access);
    
    // Try to get user data
    try {
      const user = await getCurrentUser();
      dispatch({ 
        type: AUTH_REFRESH_SUCCESS,
        payload: user
      });
    } catch (error) {
      // If we can't get user data, at least we refreshed the token
      dispatch({ type: AUTH_REFRESH_SUCCESS });
    }
    
    return Promise.resolve();
  } catch (error) {
    // If refresh fails, logout
    removeTokens();
    dispatch({ type: AUTH_REFRESH_FAIL });
    return Promise.reject(error);
  }
};

// Load user info
export const loadUser = () => async dispatch => {
  try {
    const user = await getCurrentUser();
    
    dispatch({
      type: AUTH_USER_LOADED,
      payload: user
    });
  } catch (error) {
    // If we can't get user info, try to refresh the token
    dispatch(refreshToken());
  }
};
