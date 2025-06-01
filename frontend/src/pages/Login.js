import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider, Paper, TextField, List } from '@mui/material';
import '../styles/Login.css';
import apiClient from '../apiClient';
import {useAuth} from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    logout();
  }

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (password !== repeatPassword) {
          setError('Passwords do not match');
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters long');
          return;
        }
        if (!/\d/.test(password)) {
          setError('Password must contain at least one number');
          return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          setError('Password must contain at least one special character');
          return;
        }
        if (!/[A-Z]/.test(password)) {
          setError('Password must contain at least one uppercase letter');
          return;
        }
        if (!/[a-z]/.test(password)) {
          setError('Password must contain at least one lowercase letter');
          return;
        }

        await apiClient.post('/auth/register', { email, password });
        alert('Account created! You can now log in.');
        setIsRegistering(false);
      } else {
        const response = await apiClient.post('/auth/login', { email, password });
        const { accessToken, refreshToken } = response.data;
        login(accessToken, refreshToken);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login/Register error:', err);
      if (err.response?.data) {
        if (err.response.data.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else {
        setError(typeof err.response.data === 'string' ? err.response.data : err.response.data.message || 'An error occurred.');
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };

  return (
      <Box className="login-container">
        <Paper elevation={3} className="login-paper">
          <Box className="login-content">
            <Typography variant="h4" component="h1" className="welcome-text">Welcome To</Typography>
            <Typography variant="h2" component="h2" className="app-name">Money Tracker</Typography>
            <Divider className="divider" />
            <Box component="form" className="manual-login-form" onSubmit={handleManualLogin}>
              <Typography variant="h6" className="manual-login-title">
                {isRegistering ? 'Create Account' : 'Login to Your Account'}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{ flex: '1 1 100%' }}
                />
                {isRegistering && (
                  <Box>
                    <Typography sx={{ textAlign: 'left', fontSize: 16 }} className="password-requirements">
                      A password must:
                    </Typography>
                    <List className="password-requirements-list" sx={{ paddingLeft: 2, marginBottom: 2, marginLeft: 2, textAlign: 'left', listStyleType: 'disc' }}>
                      <li>8 characters long</li>
                      <li>Contain at least one number</li>
                      <li>Contain at least one special character</li>
                      <li>Contain at least one uppercase letter</li>
                      <li>Contain at least one lowercase letter</li>
                    </List>
                  </Box>
                )}
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ flex: '1 1 100%' }}
                />
                {isRegistering && (
                  <TextField
                    label="Repeat Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    required
                    sx={{ flex: '1 1 100%' }}
                  />
                )}
              </Box>
              {error && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
              )}

              <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  className="manual-login-button"
                  type="submit"
                  disabled={loading}
              >
                {loading ? (isRegistering ? 'Registering...' : 'Logging in...') : isRegistering ? 'Register' : 'Login'}
              </Button>

              <Button
                  variant="text"
                  className="toggle-login-mode"
                  onClick={toggleRegister}
                  disabled={loading}
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
