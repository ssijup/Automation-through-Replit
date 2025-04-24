import { 
  AUTH_LOGIN_REQUEST,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGIN_FAIL,
  AUTH_LOGOUT,
  AUTH_REFRESH_REQUEST,
  AUTH_REFRESH_SUCCESS,
  AUTH_REFRESH_FAIL,
  AUTH_USER_LOADED
} from './actions';

// Initial auth state
const initialAuthState = {
  isAuthenticated: localStorage.getItem('access_token') ? true : false,
  user: null,
  loading: false,
  error: null
};

// Auth reducer
const authReducer = (state = initialAuthState, action) => {
  switch (action.type) {
    case AUTH_LOGIN_REQUEST:
    case AUTH_REFRESH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    
    case AUTH_REFRESH_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload || state.user,
        loading: false,
        error: null
      };
    
    case AUTH_LOGIN_FAIL:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload
      };
    
    case AUTH_REFRESH_FAIL:
    case AUTH_LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      };
    
    case AUTH_USER_LOADED:
      return {
        ...state,
        user: action.payload,
        loading: false
      };
    
    default:
      return state;
  }
};

export default {
  authReducer
};
