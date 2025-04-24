import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  Fab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Switch,
  FormControlLabel,
  Pagination,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { fetchAnnouncements } from '../store/actions';
import { deleteAnnouncement, toggleAnnouncementStatus } from '../utils/api';
import moment from 'moment';

const Announcements = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: announcements, loading, total } = useSelector(state => state.announcements);
  
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);
  
  const itemsPerPage = 6;
  const pageCount = Math.ceil(total / itemsPerPage);
  
  useEffect(() => {
    dispatch(fetchAnnouncements(page));
  }, [dispatch, page]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleAddAnnouncement = () => {
    navigate('/announcements/new');
  };
  
  const handleEditAnnouncement = (id) => {
    navigate(`/announcements/${id}`);
  };
  
  const handleDeleteClick = (announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAnnouncementToDelete(null);
  };
  
  const handleDeleteConfirm = async () => {
    if (!announcementToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      await deleteAnnouncement(announcementToDelete.id);
      dispatch(fetchAnnouncements(page));
    } catch (error) {
      console.error('Error deleting announcement:', error);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };
  
  const handleToggleStatus = async (id, currentStatus) => {
    setStatusUpdateLoading(id);
    
    try {
      await toggleAnnouncementStatus(id, !currentStatus);
      dispatch(fetchAnnouncements(page));
    } catch (error) {
      console.error('Error updating announcement status:', error);
    } finally {
      setStatusUpdateLoading(null);
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Announcements</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddAnnouncement}
        >
          Add Announcement
        </Button>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : announcements.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No announcements found
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((announcement) => (
            <Grid item xs={12} md={6} lg={4} key={announcement.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {announcement.title}
                    </Typography>
                    <Chip 
                      label={announcement.is_active ? 'Active' : 'Inactive'} 
                      color={announcement.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {announcement.content}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    Created by {announcement.created_by_username} on {moment(announcement.created_at).format('MMMM Do, YYYY')}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={announcement.is_active}
                        onChange={() => handleToggleStatus(announcement.id, announcement.is_active)}
                        disabled={statusUpdateLoading === announcement.id}
                        size="small"
                      />
                    }
                    label={statusUpdateLoading === announcement.id ? 'Updating...' : 'Active'}
                  />
                  
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditAnnouncement(announcement.id)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(announcement)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Pagination */}
      {pageCount > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination 
            count={pageCount} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
      
      {/* Add button (fixed position) */}
      <Fab
        color="primary"
        aria-label="add"
        className="action-button"
        onClick={handleAddAnnouncement}
      >
        <AddIcon />
      </Fab>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Announcement</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the announcement "{announcementToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Announcements;