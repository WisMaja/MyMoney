import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { getCurrentUser } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import '../styles/Header.css';

const Header = ({ title }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Set profile image if available
      if (userData.profileImageUrl) {
        // If it's a relative URL, prepend the server URL
        const imageUrl = userData.profileImageUrl.startsWith('http') 
          ? userData.profileImageUrl 
          : `http://localhost:5032${userData.profileImageUrl}`;
        setProfileImage(imageUrl);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to default user data
      setUser({
        fullName: 'User',
        id: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Box className="header">
        <Typography variant="h4" component="h1" className="header-title">
          {title}
        </Typography>
        <Box className="user-profile">
          <Avatar className="user-avatar" />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="header">
      <Typography variant="h4" component="h1" className="header-title">
        {title}
      </Typography>
      <Box className="user-profile">
        <Typography variant="body1" className="user-name">
          {user?.fullName || 'User'}
        </Typography>
        <IconButton
          onClick={handleMenuOpen}
          className="user-avatar-button"
        >
          <Avatar 
            className="user-avatar"
            src={profileImage}
          >
            {!profileImage && getUserInitials()}
          </Avatar>
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleProfileClick}>
            <PersonIcon sx={{ mr: 1 }} />
            Profile Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header; 