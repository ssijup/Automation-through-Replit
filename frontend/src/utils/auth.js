/**
 * Authentication utility functions
 */

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

// Get tokens from local storage
export const getTokens = () => {
  return {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token')
  };
};

// Set tokens in local storage
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// Remove tokens from local storage
export const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Check if the user has a specific role
export const hasRole = (user, role) => {
  if (!user) return false;
  return user.role === role;
};

// Check if the user has any of the specified roles
export const hasAnyRole = (user, roles) => {
  if (!user) return false;
  return roles.includes(user.role);
};

// Check if token is expired (simple check, not full JWT decode)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Get payload part of JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);
    
    // Check if expired
    return exp * 1000 < Date.now();
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return true;
  }
};
