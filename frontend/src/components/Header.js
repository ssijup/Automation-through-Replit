import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar,
  Menu,
  MenuItem,
  Button,
  Box
} from '@mui/material';
import { Menu as MenuIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { logout } from '../store/actions';

const Header = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/login');
  };
  
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`;
  };
  
  const getUserRole = () => {
    if (!user) return '';
    
    switch (user.role) {
      case 'PLATFORM_ADMIN':
        return 'Platform Admin';
      case 'SUPPORT_STAFF':
        return 'Support Staff';
      case 'WAREHOUSE_ADMIN':
        return 'Warehouse Admin';
      default:
        return '';
    }
  };
  
  return (
    <AppBar position="fixed" className="header">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Warehouse Admin Panel
        </Typography>
        
        {user && (
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              {getUserRole()}
            </Typography>
            
            <Button 
              color="inherit" 
              onClick={handleMenuOpen}
              startIcon={
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {getUserInitials()}
                </Avatar>
              }
            >
              {user.username}
            </Button>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;