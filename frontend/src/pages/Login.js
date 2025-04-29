import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider, Paper, TextField } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    // In a real app, you would implement the actual authentication logic here
    navigate('/dashboard');
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    console.log('Manual login with:', email, password);
    // In a real app, you would implement the actual authentication logic here
    navigate('/dashboard');
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
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
              aria-label="Login with Google"
            >
              <GoogleIcon className="social-icon" />
            </Button>
            
            <Button 
              variant="outlined" 
              className="social-button facebook-button"
              onClick={() => handleSocialLogin('Facebook')}
              aria-label="Login with Facebook"
            >
              <FacebookIcon className="social-icon" />
            </Button>
          </Box>
          
          <Divider className="divider" />
          
          <Box className="manual-login-form" component="form" onSubmit={handleManualLogin}>
            <Typography variant="h6" className="manual-login-title">
              {isRegistering ? 'Create Account' : 'Login to Your Account'}
            </Typography>
            
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              className="manual-login-button"
              type="submit"
            >
              {isRegistering ? 'Register' : 'Login'}
            </Button>
            
            <Button 
              variant="text" 
              className="toggle-login-mode" 
              onClick={toggleRegister}
            >
              {isRegistering ? 'Back to Login' : 'Need an account? Register'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 