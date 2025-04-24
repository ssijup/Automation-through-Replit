import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warehouse as WarehouseIcon,
  Announcement as AnnouncementIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = () => {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  
  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
          border: 'none',
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)'
        },
      }}
    >
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Admin Panel
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem 
          button 
          component={Link} 
          to="/dashboard"
          selected={isActive('/dashboard')}
        >
          <ListItemIcon>
            <DashboardIcon color={isActive('/dashboard') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/warehouses"
          selected={isActive('/warehouses')}
        >
          <ListItemIcon>
            <WarehouseIcon color={isActive('/warehouses') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Warehouses" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/announcements"
          selected={isActive('/announcements')}
        >
          <ListItemIcon>
            <AnnouncementIcon color={isActive('/announcements') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Announcements" />
        </ListItem>
        
        {user && user.role === 'PLATFORM_ADMIN' && (
          <ListItem 
            button 
            component={Link} 
            to="/users"
            selected={isActive('/users')}
          >
            <ListItemIcon>
              <PeopleIcon color={isActive('/users') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="User Management" />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;
