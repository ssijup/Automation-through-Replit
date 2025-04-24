import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch warehouse data if in edit mode
  useEffect(() => {
    const fetchWarehouse = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        const data = await getWarehouse(id);
        setFormData({
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude
        });
      } catch (err) {
        setError('Failed to load warehouse data. Please try again.');
        console.error('Error fetching warehouse:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouse();
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.latitude) {
      errors.latitude = 'Latitude is required';
    } else if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Latitude must be a number between -90 and 90';
    }
    
    if (!formData.longitude) {
      errors.longitude = 'Longitude is required';
    } else if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Longitude must be a number between -180 and 180';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the form errors and try again.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const warehouseData = {
        city: formData.city,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };
      
      if (isEditMode) {
        await updateWarehouse(id, warehouseData);
      } else {
        await createWarehouse(warehouseData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/warehouses');
      }, 1500);
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} warehouse. Please try again.`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} warehouse:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/warehouses')}
          sx={{ mr: 2 }}
        >
          Back to Warehouses
        </Button>
        <Typography variant="h4">
          {isEditMode ? 'Edit Warehouse' : 'Add New Warehouse'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Warehouse {isEditMode ? 'updated' : 'created'} successfully!
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
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                type="number"
                inputProps={{ 
                  step: "0.000001",
                  min: -90,
                  max: 90
                }}
                value={formData.latitude}
                onChange={handleInputChange}
                required
                disabled={loading}
                helperText="Value between -90 and 90"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                type="number"
                inputProps={{ 
                  step: "0.000001",
                  min: -180,
                  max: 180
                }}
                value={formData.longitude}
                onChange={handleInputChange}
                required
                disabled={loading}
                helperText="Value between -180 and 180"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Saving...' : 'Save Warehouse'}
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
