import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert
} from '@mui/material';
import { getUser, createUser, updateUser } from '../utils/api';
import { hasRole } from '../utils/auth';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const { user: currentUser } = useSelector(state => state.auth);
  
  // Check if current user is platform admin
  const isPlatformAdmin = currentUser && hasRole(currentUser, 'PLATFORM_ADMIN');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'WAREHOUSE_ADMIN'
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    // Only platform admins can access this page
    if (!isPlatformAdmin) {
      navigate('/dashboard');
      return;
    }
    
    const fetchUser = async () => {
      if (!isEditMode) return;
      
      setLoading(true);
      try {
        const data = await getUser(id);
        setFormData({
          username: data.username,
          email: data.email,
          password: '',
          password2: '',
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id, isEditMode, navigate, isPlatformAdmin]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!isEditMode) {
      if (!formData.password) {
        setError('Password is required');
        return false;
      }
      
      if (formData.password !== formData.password2) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return false;
    }
    
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Prepare data for submission
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role
      };
      
      if (!isEditMode) {
        userData.password = formData.password;
        userData.password2 = formData.password2;
      }
      
      if (isEditMode) {
        await updateUser(id, userData);
        setSuccess('User updated successfully');
      } else {
        await createUser(userData);
        setSuccess('User created successfully');
        
        // Reset form after successful create
        if (!isEditMode) {
          setFormData({
            username: '',
            email: '',
            password: '',
            password2: '',
            first_name: '',
            last_name: '',
            role: 'WAREHOUSE_ADMIN'
          });
        }
      }
      
      // Navigate back to the users list after a short delay
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.detail || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!isPlatformAdmin) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography>You don't have permission to access this page.</Typography>
      </Box>
    );
  }
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit User' : 'Create User'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isEditMode} // Username cannot be changed in edit mode
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            
            {!isEditMode && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEditMode}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="password2"
                    type="password"
                    value={formData.password2}
                    onChange={handleChange}
                    required={!isEditMode}
                    error={formData.password !== formData.password2 && formData.password2 !== ''}
                    helperText={formData.password !== formData.password2 && formData.password2 !== '' ? 'Passwords do not match' : ''}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="PLATFORM_ADMIN">Platform Admin</MenuItem>
                  <MenuItem value="SUPPORT_STAFF">Support Staff</MenuItem>
                  <MenuItem value="WAREHOUSE_ADMIN">Warehouse Admin</MenuItem>
                </Select>
                <FormHelperText>
                  Platform Admin: Can manage all users and resources
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/users')}
                  sx={{ mr: 2 }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : isEditMode ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UserForm;