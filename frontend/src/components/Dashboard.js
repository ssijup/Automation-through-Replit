import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Announcement as AnnouncementIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { 
  fetchWarehouses, 
  fetchRecentAnnouncements,
  fetchUsers 
} from '../store/actions';
import { getUsersCount, getWarehousesCount } from '../utils/api';
import { hasRole } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { recent: recentAnnouncements, loading: announcementsLoading } = useSelector(state => state.announcements);
  
  const [usersCount, setUsersCount] = useState(0);
  const [warehousesCount, setWarehousesCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setStatsLoading(true);
      
      try {
        // Fetch recent announcements
        dispatch(fetchRecentAnnouncements(5));
        
        // Fetch counts if user is platform admin
        if (user && hasRole(user, 'PLATFORM_ADMIN')) {
          const users = await getUsersCount();
          setUsersCount(users);
        }
        
        // All roles can see warehouses
        const warehouses = await getWarehousesCount();
        setWarehousesCount(warehouses);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [dispatch, user]);
  
  const pieChartData = {
    labels: ['Warehouses', 'Announcements', 'Users'],
    datasets: [
      {
        data: [warehousesCount, recentAnnouncements?.length || 0, usersCount],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <Box className="dashboard-container">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card className="card">
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocationIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {statsLoading ? <CircularProgress size={20} /> : warehousesCount}
                  </Typography>
                  <Typography color="textSecondary">
                    Warehouses
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="card">
            <CardContent>
              <Box display="flex" alignItems="center">
                <AnnouncementIcon fontSize="large" color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {announcementsLoading ? <CircularProgress size={20} /> : recentAnnouncements?.length || 0}
                  </Typography>
                  <Typography color="textSecondary">
                    Active Announcements
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {hasRole(user, 'PLATFORM_ADMIN') && (
          <Grid item xs={12} md={4}>
            <Card className="card">
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PeopleIcon fontSize="large" color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h5" component="div">
                      {statsLoading ? <CircularProgress size={20} /> : usersCount}
                    </Typography>
                    <Typography color="textSecondary">
                      Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {/* Chart Card */}
        <Grid item xs={12} md={6}>
          <Card className="card">
            <CardHeader title="System Overview" />
            <Divider />
            <CardContent>
              {statsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Announcements */}
        <Grid item xs={12} md={6}>
          <Card className="card">
            <CardHeader 
              title="Recent Announcements" 
              action={
                <Button 
                  color="primary" 
                  onClick={() => navigate('/announcements')}
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {announcementsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <CircularProgress />
                </Box>
              ) : recentAnnouncements?.length > 0 ? (
                <List sx={{ height: 300, overflow: 'auto' }}>
                  {recentAnnouncements.map((announcement) => (
                    <React.Fragment key={announcement.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={announcement.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {announcement.content.substring(0, 100)}
                                {announcement.content.length > 100 ? '...' : ''}
                              </Typography>
                              <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                {moment(announcement.created_at).format('MMMM Do, YYYY')} by {announcement.created_by_username}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <Typography variant="body1" color="textSecondary">
                    No announcements found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;