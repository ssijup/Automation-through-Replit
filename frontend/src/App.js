import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { refreshToken } from './store/actions';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Warehouses from './components/Warehouses';
import WarehouseForm from './components/WarehouseForm';
import Announcements from './components/Announcements';
import AnnouncementForm from './components/AnnouncementForm';
import Users from './components/Users';
import UserForm from './components/UserForm';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // Check for token and refresh if needed
  useEffect(() => {
    if (localStorage.getItem('refresh_token')) {
      dispatch(refreshToken());
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app">
          {isAuthenticated && (
            <>
              <Header />
              <div className="container">
                <Sidebar />
                <main className="content">
                  <Routes>
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/warehouses" element={
                      <ProtectedRoute>
                        <Warehouses />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/warehouses/add" element={
                      <ProtectedRoute>
                        <WarehouseForm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/warehouses/edit/:id" element={
                      <ProtectedRoute>
                        <WarehouseForm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/announcements" element={
                      <ProtectedRoute>
                        <Announcements />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/announcements/add" element={
                      <ProtectedRoute>
                        <AnnouncementForm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/announcements/edit/:id" element={
                      <ProtectedRoute>
                        <AnnouncementForm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/users" element={
                      <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                        <Users />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/users/add" element={
                      <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                        <UserForm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/users/edit/:id" element={
                      <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                        <UserForm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </main>
              </div>
            </>
          )}
          
          {!isAuthenticated && (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
