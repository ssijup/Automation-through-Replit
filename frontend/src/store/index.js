import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducers from './reducers';

const middleware = [thunk];

const store = createStore(
  combineReducers({
    auth: reducers.authReducer,
  }),
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
