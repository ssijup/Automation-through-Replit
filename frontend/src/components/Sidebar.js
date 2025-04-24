import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
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
import { hasRole } from '../utils/auth';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['PLATFORM_ADMIN', 'SUPPORT_STAFF', 'WAREHOUSE_ADMIN']
    },
    {
      text: 'Warehouses',
      icon: <WarehouseIcon />,
      path: '/warehouses',
      roles: ['PLATFORM_ADMIN', 'SUPPORT_STAFF', 'WAREHOUSE_ADMIN']
    },
    {
      text: 'Announcements',
      icon: <AnnouncementIcon />,
      path: '/announcements',
      roles: ['PLATFORM_ADMIN', 'SUPPORT_STAFF', 'WAREHOUSE_ADMIN']
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      path: '/users',
      roles: ['PLATFORM_ADMIN']
    }
  ];
  
  const filteredMenuItems = menuItems.filter(item => {
    return user && item.roles.some(role => hasRole(user, role));
  });
  
  if (!user) return null;
  
  return (
    <Box className="sidebar">
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Main Menu
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;