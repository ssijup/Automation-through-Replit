import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Fab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { fetchWarehouses } from '../store/actions';
import { deleteWarehouse } from '../utils/api';
import moment from 'moment';

const Warehouses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: warehouses, loading, total } = useSelector(state => state.warehouses);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    dispatch(fetchWarehouses(page + 1));
  }, [dispatch, page]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleAddWarehouse = () => {
    navigate('/warehouses/new');
  };
  
  const handleEditWarehouse = (id) => {
    navigate(`/warehouses/${id}`);
  };
  
  const handleDeleteClick = (warehouse) => {
    setWarehouseToDelete(warehouse);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setWarehouseToDelete(null);
  };
  
  const handleDeleteConfirm = async () => {
    if (!warehouseToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      await deleteWarehouse(warehouseToDelete.id);
      dispatch(fetchWarehouses(page + 1));
    } catch (error) {
      console.error('Error deleting warehouse:', error);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setWarehouseToDelete(null);
    }
  };
  
  const openLocationInMaps = (latitude, longitude) => {
    window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Warehouses</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddWarehouse}
        >
          Add Warehouse
        </Button>
      </Box>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>City</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : warehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No warehouses found
                  </TableCell>
                </TableRow>
              ) : (
                warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell>{warehouse.city}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" mr={1}>
                          {`${warehouse.latitude.toFixed(4)}, ${warehouse.longitude.toFixed(4)}`}
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => openLocationInMaps(warehouse.latitude, warehouse.longitude)}
                        >
                          <LocationIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{warehouse.created_by_username}</TableCell>
                    <TableCell>{moment(warehouse.created_at).format('MMMM Do, YYYY')}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditWarehouse(warehouse.id)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(warehouse)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Add button (fixed position) */}
      <Fab
        color="primary"
        aria-label="add"
        className="action-button"
        onClick={handleAddWarehouse}
      >
        <AddIcon />
      </Fab>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Warehouse</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the warehouse in {warehouseToDelete?.city}? This action cannot be undone.
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

export default Warehouses;