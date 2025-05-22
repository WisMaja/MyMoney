import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider, Paper, TextField } from '@mui/material';
import '../styles/Login.css';
import apiClient from '../apiClient';
import {useAuth} from "../hooks/useAuth";
import { AuthProvider } from '../context/AuthContext';
import { useEffect, useRef } from 'react';


const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (password !== repeatPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        await apiClient.post('/auth/register', {
          email,
          password,
        });

        alert('Account created! You can now log in.');
        setIsRegistering(false);
      } else {
        const response = await apiClient.post('/auth/login', {
          email,
          password,
        });

        const { accessToken, refreshToken } = response.data;
        login(accessToken, refreshToken);

        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError('Unexpected error occurred.');
      }
    }

    setLoading(false);
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
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    sx={{ flex: '1 1 48%' }}
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
                        sx={{ flex: '1 1 48%' }}
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
