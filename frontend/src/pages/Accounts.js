import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  IconButton,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
// Nieużywane importy po zakomentowaniu funkcjonalności banków
// import HomeIcon from '@mui/icons-material/Home';
// import ShowChartIcon from '@mui/icons-material/ShowChart';
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
// import PeopleIcon from '@mui/icons-material/People';
// import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import Sidebar from '../components/Sidebar';
import { getAllWallets, createWallet, setMainWallet, getMainWallet } from '../services/walletService';

import '../styles/Accounts.css';

const Accounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [mainAccountId, setMainAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all wallets
      const walletsData = await getAllWallets();
      
      // Fetch main wallet info
      const mainWalletData = await getMainWallet();
      
      // Create account objects with icons for UI
      const accountIcons = {
        Personal: <AccountBalanceIcon />,
        Credit: <CreditCardIcon />,
        Savings: <SavingsIcon />
      };
      
      const mappedAccounts = walletsData.map(wallet => ({
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        balance: wallet.currentBalance,
        currency: wallet.currency,
        initialBalance: wallet.initialBalance,
        icon: accountIcons[wallet.type] || <AccountBalanceIcon />
      }));
      
      setAccounts(mappedAccounts);
      setMainAccountId(mainWalletData.id);
    } catch (err) {
      console.error('Error loading wallets:', err);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [isAddAccountDialogOpen, setAddAccountDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'Personal',
    balance: '',
    currency: 'zł'
  });

  const handleOpenAddAccountDialog = () => {
    setAddAccountDialogOpen(true);
  };

  const handleCloseAddAccountDialog = () => {
    setAddAccountDialogOpen(false);
    setNewAccount({
      name: '',
      type: 'Personal',
      balance: '',
      currency: 'zł'
    });
  };

  const handleNewAccountChange = (e) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.type || !newAccount.balance || !newAccount.currency) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      setActionLoading(true);
      
      // Map currency symbols to currency codes
      const currencyMap = {
        'zł': 'PLN',
        '€': 'EUR',
        '$': 'USD',
        '£': 'GBP'
      };
      
      // Map type strings to enum values - must match exactly with API enum
      const typeMap = {
        'Personal': 'Personal',
        'Credit': 'Credit', 
        'Savings': 'Savings'
      };
      
      const walletData = {
        name: newAccount.name,
        type: typeMap[newAccount.type] || 'Personal', // Default to Personal if mapping fails
        currency: currencyMap[newAccount.currency] || 'PLN', // Default to PLN if mapping fails
        initialBalance: parseFloat(newAccount.balance)
      };
      
      console.log('Original currency:', newAccount.currency);
      console.log('Mapped currency:', walletData.currency);
      console.log('Original type:', newAccount.type);
      console.log('Mapped type:', walletData.type);
      console.log('Sending wallet data:', walletData);
      
      // Create the wallet via API
      await createWallet(walletData);
      
      // Reload wallets
      await loadWallets();
      
      showNotification('Account created successfully', 'success');
      handleCloseAddAccountDialog();
    } catch (err) {
      console.error('Error creating account:', err);
      showNotification('Failed to create account', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetMainAccount = async (accountId) => {
    try {
      setActionLoading(true);
      await setMainWallet(accountId);
      setMainAccountId(accountId);
      showNotification('Main account updated successfully', 'success');
      
      // Reload wallets
      await loadWallets();
    } catch (err) {
      console.error('Error setting main account:', err);
      showNotification('Failed to update main account', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  if (loading) {
    return (
      <Box className="page-container">
        <Sidebar />
        <Box className="page-content" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="page-container">
        <Sidebar />
        <Box className="page-content" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 5 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button variant="contained" onClick={loadWallets}>Try Again</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="page-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box className="page-content">
        {/* Header */}
        <Box className="accounts-header">
          <Typography variant="h4" component="h1" className="accounts-title">
            My Accounts & Wallets
          </Typography>
          <Box className="accounts-actions">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddAccountDialog}
            >
              Add Account
            </Button>
          </Box>
        </Box>

        {/* Accounts List */}
        <Box className="accounts-list">
          {accounts.map(account => (
            <Paper key={account.id} className="account-card">
              <Box className="account-header">
                <Typography className="account-name">
                  {account.icon}
                  {account.name}
                  {account.id === mainAccountId && (
                    <Tooltip title="Main Account">
                      <StarIcon sx={{ ml: 1, color: 'gold' }} />
                    </Tooltip>
                  )}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {account.id !== mainAccountId && (
                    <Tooltip title="Set as Main Account">
                      <IconButton size="small" onClick={() => handleSetMainAccount(account.id)}>
                        <StarOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Box>
              </Box>

              <Typography className="account-balance">
                {account.balance} {account.currency}
              </Typography>

              {account.type === 'Personal' && (
                <>
                  <Box className="account-details">
                    <Box className="account-detail">
                      <Typography className="detail-label">Initial Balance</Typography>
                      <Typography className="detail-value">{account.initialBalance} {account.currency}</Typography>
                    </Box>
                    <Box className="account-detail">
                      <Typography className="detail-label">
                        {account.id === mainAccountId ? "Main Account" : "Regular Account"}
                      </Typography>
                      <Typography className="detail-value">
                        {account.id === mainAccountId ? "Yes" : "No"}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}

              {account.type === 'Credit' && (
                <>
                  <Box className="account-details">
                    <Box className="account-detail">
                      <Typography className="detail-label">Credit Limit</Typography>
                      <Typography className="detail-value">5000 {account.currency}</Typography>
                    </Box>
                    <Box className="account-detail">
                      <Typography className="detail-label">Used</Typography>
                      <Typography className="detail-value">15%</Typography>
                    </Box>
                  </Box>
                </>
              )}

              {account.type === 'Savings' && (
                <>
                  <Box className="account-details">
                    <Box className="account-detail">
                      <Typography className="detail-label">Interest Rate</Typography>
                      <Typography className="detail-value">2.5%</Typography>
                    </Box>
                    <Box className="account-detail">
                      <Typography className="detail-label">Goal</Typography>
                      <Typography className="detail-value">{account.balance * 2} {account.currency}</Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>
          ))}

          {/* Add Account Container */}
          <Box className="add-account-container" onClick={handleOpenAddAccountDialog}>
            <AddIcon sx={{ fontSize: 40, color: '#4a148c' }} />
          </Box>
        </Box>
      </Box>

      {/* Add Account Dialog */}
      <Dialog 
        open={isAddAccountDialogOpen} 
        onClose={handleCloseAddAccountDialog}
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle>Add New Account</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              autoFocus
              name="name"
              label="Account Name"
              value={newAccount.name}
              onChange={handleNewAccountChange}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel id="account-type-label">Account Type</InputLabel>
              <Select
                labelId="account-type-label"
                name="type"
                value={newAccount.type}
                label="Account Type"
                onChange={handleNewAccountChange}
              >
                <MenuItem value="Personal">Personal Account</MenuItem>
                <MenuItem value="Credit">Credit Card</MenuItem>
                <MenuItem value="Savings">Savings Account</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="balance"
              label={newAccount.type === 'Credit' ? 'Current Balance (negative for debt)' : 'Current Balance'}
              type="number"
              value={newAccount.balance}
              onChange={handleNewAccountChange}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select
                labelId="currency-label"
                name="currency"
                value={newAccount.currency}
                label="Currency"
                onChange={handleNewAccountChange}
              >
                <MenuItem value="zł">Polish Złoty (zł)</MenuItem>
                <MenuItem value="€">Euro (€)</MenuItem>
                <MenuItem value="$">US Dollar ($)</MenuItem>
                <MenuItem value="£">British Pound (£)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddAccountDialog} color="primary" disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddAccount} 
            color="primary" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Add Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Accounts; 