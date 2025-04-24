import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

// Create store with thunk middleware for async actions
const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;