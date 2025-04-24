// Authentication utilities

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = () => {
  return localStorage.getItem('access_token') !== null;
};

/**
 * Get JWT tokens from localStorage
 */
export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token')
  };
};

/**
 * Store JWT tokens in localStorage
 */
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
};

/**
 * Remove JWT tokens from localStorage
 */
export const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

/**
 * Check if user has any of the given roles
 */
export const hasAnyRole = (user, roles) => {
  if (!user || !user.role || !roles.length) return false;
  return roles.includes(user.role);
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Date.now() / 1000;
  } catch (e) {
    return true;
  }
};