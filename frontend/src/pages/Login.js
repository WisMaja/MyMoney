import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    // In a real app, you would implement the actual authentication logic here
    navigate('/dashboard');
  };

  return (
    <Box className="login-container">
      <Paper elevation={3} className="login-paper">
        <Box className="login-content">
          <Typography variant="h4" component="h1" className="welcome-text">
            Welcome To
          </Typography>
          <Typography variant="h2" component="h2" className="app-name">
            Money Tracker
          </Typography>
          
          <Divider className="divider" />
          
          <Typography variant="h6" component="h3" className="login-with-text">
            Login with:
          </Typography>
          
          <Box className="social-buttons">
            <Button 
              variant="outlined" 
              className="social-button google-button"
              onClick={() => handleSocialLogin('Google')}
              startIcon={<GoogleIcon />}
              aria-label="Login with Google"
            />
            
            <Button 
              variant="outlined" 
              className="social-button facebook-button"
              onClick={() => handleSocialLogin('Facebook')}
              startIcon={<FacebookIcon />}
              aria-label="Login with Facebook"
            />
            
            <Button 
              variant="outlined" 
              className="social-button apple-button"
              onClick={() => handleSocialLogin('Apple')}
              startIcon={<AppleIcon />}
              aria-label="Login with Apple"
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 