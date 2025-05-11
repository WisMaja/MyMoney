import React, { useState } from 'react';
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
  Alert
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
import Sidebar from '../components/Sidebar';
import '../styles/Settings.css';
import { useAuth } from '../hooks/useAuth';


const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeSection, setActiveSection] = useState('profile');
  const [originalUserSettings, setOriginalUserSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'email@example.com',
      phone: '+1 123 456 789'
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
      name: 'John Doe',
      email: 'email@example.com',
      phone: '+1 123 456 789'
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

  const navigateToDashboard = () => {
    navigate('/dashboard');
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

  const handleInputChange = (section, setting) => (event) => {
    handleSettingChange(section, setting, event.target.value);
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
    navigate('/');
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleSaveProfileChanges = () => {
    // Tutaj byłoby połączenie z API do aktualizacji danych profilu
    setOriginalUserSettings({
      ...originalUserSettings,
      profile: { ...userSettings.profile }
    });
    
    setSnackbarMessage('Profil został zaktualizowany pomyślnie!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleSelectProfileImage = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfileImage(URL.createObjectURL(file));
      
      // Tutaj byłoby połączenie z API do przesłania obrazu
      setIsUploading(true);
      
      // Symulacja przesyłania
      setTimeout(() => {
        setIsUploading(false);
        setSnackbarMessage('Zdjęcie profilowe zostało zaktualizowane!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }, 2000);
    }
  };

  const hasProfileChanges = () => {
    const originalProfile = originalUserSettings.profile;
    const currentProfile = userSettings.profile;
    
    return (
      originalProfile.name !== currentProfile.name ||
      originalProfile.email !== currentProfile.email ||
      originalProfile.phone !== currentProfile.phone
    );
  };

  const renderSettingsContent = () => {
    switch(activeSection) {
      case 'profile':
        return (
          <Box className="settings-section">
            <Typography className="settings-section-title">
              Ustawienia Profilu
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 4, alignItems: 'center' }}>
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
                    {isUploading ? 'Przesyłanie...' : 'Zmień zdjęcie'}
                  </Button>
                </label>
              </Box>
            </Box>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">Imię i Nazwisko</Typography>
              <TextField
                className="settings-input"
                value={userSettings.profile.name}
                onChange={handleInputChange('profile', 'name')}
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
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">Numer Telefonu</Typography>
              <TextField
                className="settings-input"
                value={userSettings.profile.phone}
                onChange={handleInputChange('profile', 'phone')}
                fullWidth
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
                Zapisz Zmiany
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
            
            <Button variant="outlined" sx={{ mt: 2 }}>
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
              <Button 
                variant="contained" 
                className="danger-button"
                onClick={handleOpenDeleteDialog}
              >
                Delete Account
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2, mb: 2 }}
                onClick={handleLogout}
              >
                Wyloguj się
              </Button>
            </Box>
          </Box>
        );
        
      case 'preferences':
        return (
          <Box className="settings-section">
            <Typography className="settings-section-title">
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
        <Box className="settings-header">
          <Typography variant="h4" className="settings-title">
            Ustawienia
          </Typography>
        </Box>

        <Box className="settings-layout">
          {/* Settings Navigation */}
          <Paper className="settings-nav">
            <Typography className="settings-nav-title">
              Ustawienia
            </Typography>
            <List className="settings-nav-list">
              <ListItem
                className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => handleSectionChange('profile')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profil" />
              </ListItem>

              <ListItem
                className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
                onClick={() => handleSectionChange('notifications')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Powiadomienia" />
              </ListItem>

              <ListItem
                className={`settings-nav-item ${activeSection === 'security' ? 'active' : ''}`}
                onClick={() => handleSectionChange('security')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Bezpieczeństwo" />
              </ListItem>

              <ListItem
                className={`settings-nav-item ${activeSection === 'preferences' ? 'active' : ''}`}
                onClick={() => handleSectionChange('preferences')}
              >
                <ListItemIcon className="settings-nav-icon">
                  <ColorLensIcon />
                </ListItemIcon>
                <ListItemText primary="Preferencje" />
              </ListItem>
            </List>
          </Paper>

          {/* Settings Content */}
          <Paper className="settings-content">
            {renderSettingsContent()}
            
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
            {"Czy na pewno chcesz usunąć swoje konto?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Ta akcja nie może być cofnięta. Wszystkie Twoje dane zostaną trwale usunięte.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Anuluj</Button>
            <Button 
              onClick={handleDeleteAccount}
              color="error"
            >
              Usuń Konto
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