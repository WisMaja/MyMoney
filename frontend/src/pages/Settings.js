import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Switch,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SaveIcon from '@mui/icons-material/Save';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Settings.css';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser, updateProfileImage } from '../services/userService';
import apiClient from "../apiClient";

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isSaving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [originalUserSettings, setOriginalUserSettings] = useState({
    profile: {
      name: '',
      email: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      transactionAlerts: true,
      weeklyReports: false,
      savingsGoalAlerts: true
    },
    security: {
      twoFactorAuth: false,
      rememberDevices: true,
      autoLogout: '30'
    },
    preferences: {
      language: 'en',
      currency: '$',
      theme: 'light',
      dateFormat: 'MM/DD/YYYY'
    }
  });
  const [userSettings, setUserSettings] = useState({
    profile: {
      name: '',
      email: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      transactionAlerts: true,
      weeklyReports: false,
      savingsGoalAlerts: true
    },
    security: {
      twoFactorAuth: false,
      rememberDevices: true,
      autoLogout: '30'
    },
    preferences: {
      language: 'en',
      currency: '$',
      theme: 'light',
      dateFormat: 'MM/DD/YYYY'
    }
  });

  const [isDeleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
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
      
      // Update settings with real user data
      const updatedSettings = {
        ...userSettings,
        profile: {
          name: userData.fullName || '',
          email: userData.email || ''
        }
      };
      
      setUserSettings(updatedSettings);
      setOriginalUserSettings(updatedSettings);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setSnackbarMessage('Failed to load user data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  const navigateToDashboard = () => {
    navigate('/');
  };

  const navigateToStatistics = () => {
    navigate('/statistics');
  };

  const navigateToAccounts = () => {
    navigate('/accounts');
  };

  const navigateToSocial = () => {
    navigate('/social');
  };



  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleSettingChange = (section, setting, value) => {
    setUserSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: value
      }
    }));
  };

  const handleSwitchChange = (section, setting) => (event) => {
    handleSettingChange(section, setting, event.target.checked);
  };


  const handleOpenDeleteDialog = () => {
    setDeleteAccountDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteAccountDialogOpen(false);
  };

  const handleDeleteAccount = () => {
    alert('Account deletion functionality would go here in a real app');
    setDeleteAccountDialogOpen(false);
    navigateToLogin();
  };
  
  const handleLogout = async () => {
    await logout();
    navigateToLogin();
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleInputChange = (section, setting) => (event) => {
    const value = event.target.value;

    setUserSettings((prevSettings) => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        [setting]: value,
      },
    }));
    setHasChanges(true);
  };

// Funkcja obsługująca zapis danych profilu
  const handleSaveProfileChanges = async () => {
    try {
      setSaving(true);
      const updatedUser = {
        fullName: userSettings.profile.name.trim(),
        email: userSettings.profile.email.trim(),
        profileImageUrl: userSettings.profile.profileImageUrl || null,
      };

      await apiClient.put('/users/me', updatedUser);

      //alert('Profile updated successfully!');
      setHasChanges(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error saving profile changes:', error);
      alert('Failed to update profile. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectProfileImage = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfileImage(URL.createObjectURL(file));
      
      setIsUploading(true);
      
      try {
        const response = await updateProfileImage(file);
        // Set the profile image URL from server response
        if (response && response.profileImageUrl) {
          setProfileImage(`http://localhost:5032${response.profileImageUrl}`);
        }
        setSnackbarMessage('Profile picture updated successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error updating profile picture:', error);
        setSnackbarMessage('Failed to update profile picture. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const hasProfileChanges = () => {
    const originalProfile = originalUserSettings.profile;
    const currentProfile = userSettings.profile;
    
    return (
      originalProfile.name !== currentProfile.name ||
      originalProfile.email !== currentProfile.email
    );
  };

  const renderSettingsContent = () => {
    switch(activeSection) {
      case 'profile':
        return (
          <Box className="settings-section">
            <Typography className="settings-section-title">
              Profile Settings
            </Typography>
            
            <Box sx={{ display: 'flex', marginY: 4, alignItems: 'center' }}>
              <Avatar
                src={profileImage}
                sx={{ width: 100, height: 100, mr: 3 }}
              >
                {userSettings.profile.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-photo-upload"
                  type="file"
                  onChange={handleSelectProfileImage}
                />
                <label htmlFor="profile-photo-upload">
                  <Button 
                    variant="outlined" 
                    component="span"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Change Photo'}
                  </Button>
                </label>
              </Box>
            </Box>
            
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">Full Name</Typography>
              <TextField
                className="settings-input"
                value={userSettings.profile.name}
                onChange={handleInputChange('profile', 'name')} // Poprawne przypisanie funkcji
                fullWidth
              />
            </Box>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">Email</Typography>
              <TextField
                className="settings-input"
                value={userSettings.profile.email}
                onChange={handleInputChange('profile', 'email')}
                fullWidth
                type="email"
              />
            </Box>


            <Box className="settings-button-group">
              <Button
                variant="contained"
                className="settings-save-button"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfileChanges}
                disabled={!hasProfileChanges()}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        );
        
      case 'notifications':
        return (
          <Box className="settings-section">
            <Typography className="settings-section-title">
              Notification Settings
            </Typography>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">Email Notifications</Typography>
              <Switch
                checked={userSettings.notifications.emailNotifications}
                onChange={handleSwitchChange('notifications', 'emailNotifications')}
                color="primary"
              />
            </Box>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">Push Notifications</Typography>
              <Switch
                checked={userSettings.notifications.pushNotifications}
                onChange={handleSwitchChange('notifications', 'pushNotifications')}
                color="primary"
              />
            </Box>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">Transaction Alerts</Typography>
              <Switch
                checked={userSettings.notifications.transactionAlerts}
                onChange={handleSwitchChange('notifications', 'transactionAlerts')}
                color="primary"
              />
            </Box>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">Weekly Financial Reports</Typography>
              <Switch
                checked={userSettings.notifications.weeklyReports}
                onChange={handleSwitchChange('notifications', 'weeklyReports')}
                color="primary"
              />
            </Box>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">Savings Goal Alerts</Typography>
              <Switch
                checked={userSettings.notifications.savingsGoalAlerts}
                onChange={handleSwitchChange('notifications', 'savingsGoalAlerts')}
                color="primary"
              />
            </Box>
          </Box>
        );
        
      case 'security':
        return (
          <Box className="settings-section">
            <Typography className="settings-section-title">
              Security Settings
            </Typography>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">Two-Factor Authentication</Typography>
              <Switch
                checked={userSettings.security.twoFactorAuth}
                onChange={handleSwitchChange('security', 'twoFactorAuth')}
                color="primary"
              />
            </Box>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">Remember Devices</Typography>
              <Switch
                checked={userSettings.security.rememberDevices}
                onChange={handleSwitchChange('security', 'rememberDevices')}
                color="primary"
              />
            </Box>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">Auto Logout (minutes)</Typography>
              <TextField
                className="settings-input"
                value={userSettings.security.autoLogout}
                onChange={handleInputChange('security', 'autoLogout')}
                type="number"
                fullWidth
              />
            </Box>
            
            <Button variant="outlined" sx={{ my: 2 }}>
              Change Password
            </Button>
            
            <Divider className="settings-section-divider" />
            
            <Box className="danger-zone">
              <Typography className="danger-zone-title" variant="h6">
                Danger Zone
              </Typography>
              <Typography paragraph>
                Deleting your account is permanent and cannot be undone. All your data will be lost.
              </Typography>
              <Box className="settings-button-group" sx={{ flexDirection: 'row', gap: 1, justifyContent: 'center' }}>
                <Button 
                  variant="contained"
                  color="error"
                  onClick={handleOpenDeleteDialog}
                >
                  Delete Account
                </Button>
                <Button 
                  variant="outlined"
                  color="primary"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Box>
            </Box>
          </Box>
        );
        
      case 'preferences':
        return (
          <Box className="settings-section">
            <Typography className="settings-section-title" sx={{ mb: 2 }}>
              Preferences
            </Typography>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">Language</Typography>
              <TextField
                select
                className="settings-input"
                value={userSettings.preferences.language}
                onChange={handleInputChange('preferences', 'language')}
                fullWidth
                SelectProps={{
                  native: true,
                }}
              >
                <option value="en">English</option>
                <option value="pl">Polski</option>
                <option value="de">Deutsch</option>
              </TextField>
            </Box>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">Default Currency</Typography>
              <TextField
                select
                className="settings-input"
                value={userSettings.preferences.currency}
                onChange={handleInputChange('preferences', 'currency')}
                fullWidth
                SelectProps={{
                  native: true,
                }}
              >
                <option value="$">US Dollar ($)</option>
                <option value="zł">Polish Złoty (zł)</option>
                <option value="€">Euro (€)</option>
                <option value="£">British Pound (£)</option>
              </TextField>
            </Box>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">Theme</Typography>
              <TextField
                select
                className="settings-input"
                value={userSettings.preferences.theme}
                onChange={handleInputChange('preferences', 'theme')}
                fullWidth
                SelectProps={{
                  native: true,
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </TextField>
            </Box>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">Date Format</Typography>
              <TextField
                select
                className="settings-input"
                value={userSettings.preferences.dateFormat}
                onChange={handleInputChange('preferences', 'dateFormat')}
                fullWidth
                SelectProps={{
                  native: true,
                }}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </TextField>
            </Box>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box className="page-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box className="page-content">
        <Header title="Settings" />

        <Box className="settings-layout">
          {/* Settings Navigation */}
          <Paper className="settings-nav">
            <Typography className="settings-nav-title">
              Settings
            </Typography>
            <List className="settings-nav-list">
              <ListItem
                className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => handleSectionChange('profile')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>

              <ListItem
                className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
                onClick={() => handleSectionChange('notifications')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItem>

              <ListItem
                className={`settings-nav-item ${activeSection === 'security' ? 'active' : ''}`}
                onClick={() => handleSectionChange('security')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Security" />
              </ListItem>

              <ListItem
                className={`settings-nav-item ${activeSection === 'preferences' ? 'active' : ''}`}
                onClick={() => handleSectionChange('preferences')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <ColorLensIcon />
                </ListItemIcon>
                <ListItemText primary="Preferences" />
              </ListItem>
            </List>
          </Paper>

          {/* Settings Content */}
          <Paper className="settings-content">
            {loading ? (
              <CircularProgress />
            ) : (
              renderSettingsContent()
            )}
            
            <Box className="settings-button-group">
              <Button variant="outlined">
                Cancel
              </Button>
              <Button variant="contained" className="settings-save-button">
                Save Changes
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Delete Account Dialog */}
        <Dialog
          open={isDeleteAccountDialogOpen}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>
            {"Are you sure you want to delete your account?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button 
              onClick={handleDeleteAccount}
              color="error"
            >
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Settings;