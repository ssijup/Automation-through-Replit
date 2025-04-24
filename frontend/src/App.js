import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Warehouses from './components/Warehouses';
import WarehouseForm from './components/WarehouseForm';
import Announcements from './components/Announcements';
import AnnouncementForm from './components/AnnouncementForm';
import Users from './components/Users';
import UserForm from './components/UserForm';

// Actions
import { loadUser, refreshToken } from './store/actions';
import { isAuthenticated, isTokenExpired } from './utils/auth';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const auth = useSelector(state => state.auth);
  
  if (!auth.isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Check token and refresh if needed
    const token = localStorage.getItem('access_token');
    
    if (token) {
      if (isTokenExpired(token)) {
        dispatch(refreshToken());
      } else if (!user) {
        dispatch(loadUser());
      }
    }
  }, [dispatch, user]);
  
  return (
    <Router>
      <div className="app">
        {isAuthenticated() && <Header />}
        
        <div className="container">
          {isAuthenticated() && <Sidebar />}
          
          <Box className={`content ${isAuthenticated() ? 'with-sidebar' : ''}`}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* Warehouse Routes */}
              <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
              <Route path="/warehouses/new" element={<ProtectedRoute><WarehouseForm /></ProtectedRoute>} />
              <Route path="/warehouses/:id" element={<ProtectedRoute><WarehouseForm /></ProtectedRoute>} />
              
              {/* Announcement Routes */}
              <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
              <Route path="/announcements/new" element={<ProtectedRoute><AnnouncementForm /></ProtectedRoute>} />
              <Route path="/announcements/:id" element={<ProtectedRoute><AnnouncementForm /></ProtectedRoute>} />
              
              {/* User Routes */}
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/users/new" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
              <Route path="/users/:id" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Box>
        </div>
      </div>
    </Router>
  );
}

export default App;