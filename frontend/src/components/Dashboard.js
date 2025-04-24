import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import PersonIcon from '@mui/icons-material/Person';
import { getRecentAnnouncements, getWarehousesCount, getUsersCount } from '../utils/api';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [warehousesCount, setWarehousesCount] = useState(0);
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get warehouse count
        const warehouseData = await getWarehousesCount();
        setWarehousesCount(warehouseData.count);
        
        // Get announcements
        const announcementData = await getRecentAnnouncements();
        setAnnouncementsCount(announcementData.count);
        setRecentAnnouncements(announcementData.results);
        
        // If platform admin, get users count
        if (user.role === 'PLATFORM_ADMIN') {
          const userData = await getUsersCount();
          setUsersCount(userData.count);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.role]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        Welcome, {user.first_name} {user.last_name} ({user.role.replace('_', ' ')})
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#bbdefb',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarehouseIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Warehouses</Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
              {loading ? '...' : warehousesCount}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'right' }}>
              <Link to="/warehouses">View all warehouses</Link>
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#c8e6c9',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AnnouncementIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Announcements</Typography>
            </Box>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
              {loading ? '...' : announcementsCount}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'right' }}>
              <Link to="/announcements">View all announcements</Link>
            </Typography>
          </Paper>
        </Grid>
        
        {user.role === 'PLATFORM_ADMIN' && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: '#ffccbc',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Users</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                {loading ? '...' : usersCount}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'right' }}>
                <Link to="/users">Manage users</Link>
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      <Typography variant="h5" gutterBottom>
        Recent Announcements
      </Typography>
      
      <Card>
        <CardContent>
          {loading ? (
            <Typography>Loading recent announcements...</Typography>
          ) : recentAnnouncements.length > 0 ? (
            <List>
              {recentAnnouncements.map((announcement, index) => (
                <React.Fragment key={announcement.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={announcement.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </Typography>
                          {" — "}{announcement.content.substring(0, 100)}
                          {announcement.content.length > 100 ? '...' : ''}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < recentAnnouncements.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography>No announcements found</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
