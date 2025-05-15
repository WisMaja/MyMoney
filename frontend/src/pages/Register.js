import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container,
  IconButton,
  InputAdornment,
  Divider,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Google } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError('All fields are required');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      });
      
      if (error) throw error;
      
      alert('Registration successful! Please check your email for verification link.');
      navigate('/');
    } catch (error) {
      setError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message || 'Error signing up with Google');
    }
  };

  return (
    <Container component="main" maxWidth="xs" className="auth-container">
      <Paper elevation={3} className="auth-paper">
        <Typography component="h1" variant="h4" align="center" className="auth-title">
          Create Your Account
        </Typography>
        
        {error && <Alert severity="error" className="auth-alert">{error}</Alert>}
        
        <Box component="form" onSubmit={handleRegister} className="auth-form">
          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            name="fullName"
            variant="outlined"
            value={formData.fullName}
            onChange={handleChange}
            className="auth-input"
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            name="email"
            type="email"
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            className="auth-input"
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            className="auth-input"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="auth-input"
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className="auth-button"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
          
          <Divider className="auth-divider">
            <Typography variant="body2" color="textSecondary">
              OR
            </Typography>
          </Divider>
          
          <Box className="social-buttons">
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              onClick={handleGoogleSignUp}
              className="google-button"
            >
              Sign up with Google
            </Button>
          </Box>
          
          <Box className="auth-link-container">
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 