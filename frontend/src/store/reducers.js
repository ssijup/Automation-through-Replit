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

// Initial state
const initialState = {
  auth: {
    isAuthenticated: localStorage.getItem('access_token') ? true : false,
    user: null,
    loading: false,
    error: null
  },
  warehouses: {
    items: [],
    total: 0,
    loading: false,
    error: null
  },
  announcements: {
    items: [],
    recent: [],
    total: 0,
    loading: false,
    error: null
  },
  users: {
    items: [],
    total: 0,
    loading: false,
    error: null
  }
};

// Auth reducer
const authReducer = (state = initialState.auth, action) => {
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
        loading: false,
        error: null
      };
    case AUTH_USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
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
    case AUTH_REFRESH_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case AUTH_REFRESH_FAIL:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload
      };
    case AUTH_LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

// Warehouse reducer
const warehouseReducer = (state = initialState.warehouses, action) => {
  switch (action.type) {
    case 'WAREHOUSE_LIST_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'WAREHOUSE_LIST_SUCCESS':
      return {
        ...state,
        items: action.payload.results,
        total: action.payload.count,
        loading: false,
        error: null
      };
    case 'WAREHOUSE_LIST_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

// Announcement reducer
const announcementReducer = (state = initialState.announcements, action) => {
  switch (action.type) {
    case 'ANNOUNCEMENT_LIST_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'ANNOUNCEMENT_LIST_SUCCESS':
      return {
        ...state,
        items: action.payload.results,
        total: action.payload.count,
        loading: false,
        error: null
      };
    case 'ANNOUNCEMENT_RECENT_SUCCESS':
      return {
        ...state,
        recent: action.payload.results,
        loading: false,
        error: null
      };
    case 'ANNOUNCEMENT_LIST_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

// User reducer
const userReducer = (state = initialState.users, action) => {
  switch (action.type) {
    case 'USER_LIST_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'USER_LIST_SUCCESS':
      return {
        ...state,
        items: action.payload.results,
        total: action.payload.count,
        loading: false,
        error: null
      };
    case 'USER_LIST_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

// Combine reducers
const rootReducer = (state = initialState, action) => {
  return {
    auth: authReducer(state.auth, action),
    warehouses: warehouseReducer(state.warehouses, action),
    announcements: announcementReducer(state.announcements, action),
    users: userReducer(state.users, action)
  };
};

export default rootReducer;