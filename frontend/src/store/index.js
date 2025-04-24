import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

// Create store with thunk middleware for async actions
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
});

export default store;