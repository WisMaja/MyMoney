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
  FormControlLabel,
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
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Settings.css';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser, updateCurrentUser, updateProfileImage } from '../services/userService';
import apiClient from "../apiClient";

const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null; // brak błędów
};
const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, getAvailableLanguages } = useLanguage();

  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isSaving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // Śledzi, czy są zmiany w formularzu

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
      language: currentLanguage,
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
      language: currentLanguage,
      currency: '$',
      theme: 'light',
      dateFormat: 'MM/DD/YYYY'
    }
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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


  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setSnackbarMessage('New passwords do not match');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setSnackbarMessage(passwordError);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }


    try {
      setIsChangingPassword(true);

      await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setSnackbarMessage('Password changed successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Wyczyść pola formularza
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setActiveSection('security');
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbarMessage(
          error.response?.data || 'Failed to change password. Try again.'
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsChangingPassword(false);
    }
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
              {t('settings.profile')}
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
              <Typography className="settings-form-label">{t('settings.fullName')}</Typography>
              <TextField
                className="settings-input"
                value={userSettings.profile.name}
                onChange={handleInputChange('profile', 'name')} // Poprawne przypisanie funkcji
                fullWidth
              />
            </Box>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">{t('auth.email')}</Typography>
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
                {t('common.save')} Changes
              </Button>
            </Box>
          </Box>
        );
        
      case 'notifications':
        return (
          <Box className="settings-section">
            <Typography className="settings-section-title">
              {t('settings.notifications')}
            </Typography>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">{t('settings.emailNotifications')}</Typography>
              <Switch
                checked={userSettings.notifications.emailNotifications}
                onChange={handleSwitchChange('notifications', 'emailNotifications')}
                color="primary"
              />
            </Box>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">{t('settings.pushNotifications')}</Typography>
              <Switch
                checked={userSettings.notifications.pushNotifications}
                onChange={handleSwitchChange('notifications', 'pushNotifications')}
                color="primary"
              />
            </Box>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">{t('settings.transactionAlerts')}</Typography>
              <Switch
                checked={userSettings.notifications.transactionAlerts}
                onChange={handleSwitchChange('notifications', 'transactionAlerts')}
                color="primary"
              />
            </Box>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">{t('settings.weeklyReports')}</Typography>
              <Switch
                checked={userSettings.notifications.weeklyReports}
                onChange={handleSwitchChange('notifications', 'weeklyReports')}
                color="primary"
              />
            </Box>
            
            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">{t('settings.savingsGoalAlerts')}</Typography>
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
              {t('settings.security')}
            </Typography>

            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">{t('settings.twoFactorAuth')}</Typography>
              <Switch
                checked={userSettings.security.twoFactorAuth}
                onChange={handleSwitchChange('security', 'twoFactorAuth')}
                color="primary"
              />
            </Box>

            <Box className="settings-switch-group">
              <Typography className="settings-switch-label">{t('settings.rememberDevices')}</Typography>
              <Switch
                checked={userSettings.security.rememberDevices}
                onChange={handleSwitchChange('security', 'rememberDevices')}
                color="primary"
              />
            </Box>

            <Box className="settings-form-group">
              <Typography className="settings-form-label">{t('settings.autoLogout')}</Typography>
              <TextField
                className="settings-input"
                value={userSettings.security.autoLogout}
                onChange={handleInputChange('security', 'autoLogout')}
                type="number"
                fullWidth
              />
            </Box>

            <Divider className="settings-section-divider" />

            <Typography className="settings-section-title">
              {t('settings.changePassword')}
            </Typography>
            <Box>
              <Typography sx={{ textAlign: 'left', fontSize: 16, marginBottom: 2 }}>
                A password must:
              </Typography>
              <List sx={{ paddingLeft: 3, marginBottom: 3, textAlign: 'left', listStyleType: 'disc' }}>
                <li>Be at least 8 characters long</li>
                <li>Contain at least one number</li>
                <li>Contain at least one special character</li>
                <li>Contain at least one uppercase letter</li>
                <li>Contain at least one lowercase letter</li>
              </List>
            </Box>

            <Box className="settings-form-group">
              <Typography className="settings-form-label">{t('settings.currentPassword')}</Typography>
              <TextField
                  className="settings-input"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
              />
            </Box>
            <Box className="settings-form-group">
              <Typography className="settings-form-label">{t('settings.newPassword')}</Typography>
              <TextField
                  className="settings-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
              />
            </Box>
            <Box className="settings-form-group">
              <Typography className="settings-form-label">
                {t('settings.confirmNewPassword')}
              </Typography>
              <TextField
                  className="settings-input"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  fullWidth
              />
            </Box>
            <Box className="settings-button-group">
              <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Changing...' : t('settings.changePassword')}
              </Button>
            </Box>

            <Box className="danger-zone">
              <Typography className="danger-zone-title" variant="h6">
                {t('settings.dangerZone')}
              </Typography>
              <Typography paragraph>
                {t('settings.deleteAccountWarning')}
              </Typography>
              <Box className="settings-button-group" sx={{ flexDirection: 'row', gap: 1, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleOpenDeleteDialog}
                >
                  {t('settings.deleteAccount')}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleLogout}
                >
                  {t('auth.logout')}
                </Button>
              </Box>
            </Box>
          </Box>
        );
        
      case 'preferences':
        return (
          <Box className="settings-section">
            <Typography className="settings-section-title" sx={{ mb: 2 }}>
              {t('settings.preferences')}
            </Typography>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">{t('settings.language')}</Typography>
              <TextField
                select
                className="settings-input"
                value={currentLanguage}
                onChange={async (e) => {
                  const newLanguage = e.target.value;
                  const success = await changeLanguage(newLanguage);
                  if (success) {
                    setSnackbarMessage(t('settings.languageChanged'));
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                    
                    // Update user settings
                    setUserSettings(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        language: newLanguage
                      }
                    }));
                  } else {
                    setSnackbarMessage(t('errors.general'));
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                  }
                }}
                fullWidth
                SelectProps={{
                  native: true,
                }}
              >
                {getAvailableLanguages().map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.flag} {language.name}
                  </option>
                ))}
              </TextField>
            </Box>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">{t('settings.currency')}</Typography>
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
              <Typography className="settings-form-label">{t('settings.theme')}</Typography>
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
        <Header title={t('settings.title')} />

        <Box className="settings-layout">
          {/* Settings Navigation */}
          <Paper className="settings-nav">
            <Typography className="settings-nav-title">
              {t('settings.title')}
            </Typography>
            <List className="settings-nav-list">
              <ListItem
                className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => handleSectionChange('profile')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.profile')} />
              </ListItem>

              <ListItem
                className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
                onClick={() => handleSectionChange('notifications')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.notifications')} />
              </ListItem>

              <ListItem
                className={`settings-nav-item ${activeSection === 'security' ? 'active' : ''}`}
                onClick={() => handleSectionChange('security')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.security')} />
              </ListItem>

              <ListItem
                className={`settings-nav-item ${activeSection === 'preferences' ? 'active' : ''}`}
                onClick={() => handleSectionChange('preferences')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <ColorLensIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.preferences')} />
              </ListItem>
            </List>
          </Paper>

          {/* Settings Content */}
          <Paper
              className="settings-content"
              sx={{
                backgroundColor: 'white',
                padding: 4,
                borderRadius: 3,
              }}
          >

          {loading ? (
              <CircularProgress />
            ) : (
              renderSettingsContent()
            )}
            
            <Box className="settings-button-group">
              <Button variant="outlined">
                {t('common.cancel')}
              </Button>
              <Button variant="contained" className="settings-save-button">
                {t('common.save')} Changes
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
            {t('settings.deleteAccountConfirm')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('settings.deleteAccountWarning')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>{t('common.cancel')}</Button>
            <Button 
              onClick={handleDeleteAccount}
              color="error"
            >
              {t('settings.deleteAccount')}
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