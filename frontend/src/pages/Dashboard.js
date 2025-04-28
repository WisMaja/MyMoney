import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        p: 3
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to the Money Tracker Dashboard. This is where your financial overview will be displayed.
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => navigate('/')}
      >
        Back to Login
      </Button>
    </Box>
  );
};

export default Dashboard; 