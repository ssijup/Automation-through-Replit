import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { getWarehouse, createWarehouse, updateWarehouse } from '../utils/api';

const WarehouseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    city: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchWarehouse = async () => {
      if (!isEditMode) return;
      
      setLoading(true);
      try {
        const data = await getWarehouse(id);
        setFormData({
          city: data.city,
          latitude: String(data.latitude),
          longitude: String(data.longitude)
        });
      } catch (error) {
        console.error('Error fetching warehouse:', error);
        setError('Failed to load warehouse data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWarehouse();
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    
    if (!formData.latitude.trim() || isNaN(parseFloat(formData.latitude))) {
      setError('Please enter a valid latitude');
      return false;
    }
    
    if (!formData.longitude.trim() || isNaN(parseFloat(formData.longitude))) {
      setError('Please enter a valid longitude');
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
      const warehouseData = {
        city: formData.city.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };
      
      if (isEditMode) {
        await updateWarehouse(id, warehouseData);
        setSuccess('Warehouse updated successfully');
      } else {
        await createWarehouse(warehouseData);
        setSuccess('Warehouse created successfully');
        
        // Reset form after successful create
        if (!isEditMode) {
          setFormData({
            city: '',
            latitude: '',
            longitude: ''
          });
        }
      }
      
      // Navigate back to the warehouses list after a short delay
      setTimeout(() => {
        navigate('/warehouses');
      }, 1500);
    } catch (error) {
      console.error('Error saving warehouse:', error);
      setError(error.response?.data?.detail || 'Failed to save warehouse');
    } finally {
      setSubmitting(false);
    }
  };
  
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
        {isEditMode ? 'Edit Warehouse' : 'Create Warehouse'}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                type="number"
                inputProps={{ step: 'any' }}
                value={formData.latitude}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                type="number"
                inputProps={{ step: 'any' }}
                value={formData.longitude}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/warehouses')}
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

export default WarehouseForm;