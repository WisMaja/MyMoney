import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider, Paper, TextField } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import '../styles/Login.css';

const API_URL = 'http://localhost:8000/users';

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let endpoint = isRegistering ? '/register' : '/login';
      let payload = isRegistering
        ? { email, password, name, surname }
        : { email, password };

      if (isRegistering && password !== repeatPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include', // dla ciasteczek HttpOnly
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.detail || 'Authentication failed');
      } else {
        if (isRegistering) {
          alert('Account created! Please check your email.');
          setIsRegistering(false);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error occurred.');
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
          <Typography variant="h6" component="h3" className="login-with-text">Login with:</Typography>

          <Box className="social-buttons">
            <Button variant="outlined" className="social-button google-button" disabled>
              <GoogleIcon className="social-icon" />
            </Button>
            <Button variant="outlined" className="social-button facebook-button" disabled>
              <FacebookIcon className="social-icon" />
            </Button>
          </Box>

          <Divider className="divider" />
          <Box component="form" className="manual-login-form" onSubmit={handleManualLogin}>
            <Typography variant="h6" className="manual-login-title">
              {isRegistering ? 'Create Account' : 'Login to Your Account'}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {isRegistering && (
                <>
                  <TextField
                    label="Name"
                    type="text"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    sx={{ flex: '1 1 48%' }}
                  />
                  <TextField
                    label="Surname"
                    type="text"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                    sx={{ flex: '1 1 48%' }}
                  />
                </>
              )}

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
