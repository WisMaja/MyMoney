import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Divider, Paper, TextField } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { supabase } from '../supabaseClient';
import '../styles/Login.css';

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

 
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      if (token) {
        localStorage.setItem('access_token', token);
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleSocialLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) {
      setError(error.message);
    }
  };

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

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: `${name} ${surname}`,
            },
          }
        });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        alert('Account created! Please check your email to confirm your registration.');
        setIsRegistering(false);
        setLoading(false);
        return;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        
        if (data?.session?.access_token) {
          localStorage.setItem('access_token', data.session.access_token);
        }

        navigate('/dashboard');
      }
    } catch (err) {
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
            <Button variant="outlined" className="social-button google-button" onClick={() => handleSocialLogin('google')}>
              <GoogleIcon className="social-icon" />
            </Button>
            <Button variant="outlined" className="social-button facebook-button" onClick={() => handleSocialLogin('facebook')}>
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
