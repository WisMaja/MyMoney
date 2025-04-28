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
  DialogActions
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
import '../styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [userSettings, setUserSettings] = useState({
    profile: {
      name: 'Imię Nazwisko',
      email: 'email@example.com',
      phone: '+48 123 456 789'
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
      language: 'pl',
      currency: 'zł',
      theme: 'light',
      dateFormat: 'DD-MM-YYYY'
    }
  });
  const [isDeleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);

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

  const renderSettingsContent = () => {
    switch(activeSection) {
      case 'profile':
        return (
          <Box className="settings-section">
            <Typography className="settings-section-title">
              Profile Settings
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 4, alignItems: 'center' }}>
              <Avatar
                sx={{ width: 100, height: 100, mr: 3 }}
              >
                {userSettings.profile.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Button variant="outlined">
                Change Photo
              </Button>
            </Box>
            
            <Box className="settings-form-group">
              <Typography className="settings-form-label">Name</Typography>
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
              <Typography className="settings-form-label">Phone Number</Typography>
              <TextField
                className="settings-input"
                value={userSettings.profile.phone}
                onChange={handleInputChange('profile', 'phone')}
                fullWidth
              />
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
                <option value="pl">Polski</option>
                <option value="en">English</option>
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
                <option value="zł">Polish Złoty (zł)</option>
                <option value="€">Euro (€)</option>
                <option value="$">US Dollar ($)</option>
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
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="MM-DD-YYYY">MM-DD-YYYY</option>
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
    <Box className="settings-container">
      {/* Sidebar */}
      <Box className="sidebar">
        <HomeIcon className="sidebar-icon" onClick={navigateToDashboard} />
        <ShowChartIcon className="sidebar-icon" onClick={navigateToStatistics} />
        <AccountBalanceWalletIcon className="sidebar-icon" onClick={navigateToAccounts} />
        <PeopleIcon className="sidebar-icon" onClick={navigateToSocial} />
        <SettingsIcon className="sidebar-icon" sx={{ backgroundColor: '#d1c4e9' }} />
      </Box>

      {/* Main Content */}
      <Box className="settings-main-content">
        {/* Header */}
        <Box className="settings-header">
          <Typography variant="h4" component="h1" className="settings-title">
            Settings
          </Typography>
        </Box>

        {/* Settings Layout */}
        <Box className="settings-layout">
          {/* Settings Navigation */}
          <Paper className="settings-nav">
            <Typography className="settings-nav-title">
              Settings
            </Typography>
            <List className="settings-nav-list">
              <ListItem 
                button 
                className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => handleSectionChange('profile')}
              >
                <ListItemIcon>
                  <PersonIcon className="settings-nav-icon" />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
              
              <ListItem 
                button 
                className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
                onClick={() => handleSectionChange('notifications')}
              >
                <ListItemIcon>
                  <NotificationsIcon className="settings-nav-icon" />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItem>
              
              <ListItem 
                button 
                className={`settings-nav-item ${activeSection === 'security' ? 'active' : ''}`}
                onClick={() => handleSectionChange('security')}
              >
                <ListItemIcon>
                  <SecurityIcon className="settings-nav-icon" />
                </ListItemIcon>
                <ListItemText primary="Security" />
              </ListItem>
              
              <ListItem 
                button 
                className={`settings-nav-item ${activeSection === 'preferences' ? 'active' : ''}`}
                onClick={() => handleSectionChange('preferences')}
              >
                <ListItemIcon>
                  <ColorLensIcon className="settings-nav-icon" />
                </ListItemIcon>
                <ListItemText primary="Preferences" />
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
      </Box>

      {/* Delete Account Dialog */}
      <Dialog
        open={isDeleteAccountDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. All your data, including transaction history, accounts, and settings will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 