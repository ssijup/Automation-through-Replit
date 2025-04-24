import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import { getAnnouncement, createAnnouncement, updateAnnouncement } from '../utils/api';

const AnnouncementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!isEditMode) return;
      
      setLoading(true);
      try {
        const data = await getAnnouncement(id);
        setFormData({
          title: data.title,
          content: data.content,
          is_active: data.is_active
        });
      } catch (error) {
        console.error('Error fetching announcement:', error);
        setError('Failed to load announcement data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnnouncement();
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
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
      const announcementData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_active: formData.is_active
      };
      
      if (isEditMode) {
        await updateAnnouncement(id, announcementData);
        setSuccess('Announcement updated successfully');
      } else {
        await createAnnouncement(announcementData);
        setSuccess('Announcement created successfully');
        
        // Reset form after successful create
        if (!isEditMode) {
          setFormData({
            title: '',
            content: '',
            is_active: true
          });
        }
      }
      
      // Navigate back to the announcements list after a short delay
      setTimeout(() => {
        navigate('/announcements');
      }, 1500);
    } catch (error) {
      console.error('Error saving announcement:', error);
      setError(error.response?.data?.detail || 'Failed to save announcement');
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
        {isEditMode ? 'Edit Announcement' : 'Create Announcement'}
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
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                multiline
                rows={6}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleSwitchChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/announcements')}
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

export default AnnouncementForm;