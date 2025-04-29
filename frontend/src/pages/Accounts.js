import React, { useState } from 'react';
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
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';

import '../styles/Accounts.css';

const Accounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      name: 'Główne konto',
      type: 'checking',
      balance: 2500,
      currency: 'zł',
      income: 4500,
      expenses: 2000,
      savingsGoal: 5000,
      savingsProgress: 2500,
      icon: <AccountBalanceIcon />
    },
    {
      id: 2,
      name: 'Karta kredytowa',
      type: 'credit',
      balance: -750,
      currency: 'zł',
      limit: 5000,
      usedPercentage: 15,
      dueDate: '2023-05-15',
      icon: <CreditCardIcon />
    },
    {
      id: 3,
      name: 'Oszczędności',
      type: 'savings',
      balance: 12500,
      currency: 'zł',
      interest: 3.5,
      lastInterestDate: '2023-04-01',
      goal: 25000,
      goalDate: '2024-01-01',
      icon: <SavingsIcon />
    }
  ]);

  const [linkedBanks, setLinkedBanks] = useState([
    { id: 1, name: 'PKO Bank Polski', status: 'Connected', lastSync: '2023-04-28' },
    { id: 2, name: 'mBank', status: 'Connected', lastSync: '2023-04-28' }
  ]);

  const [isAddAccountDialogOpen, setAddAccountDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    balance: '',
    currency: 'zł'
  });

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  const navigateToStatistics = () => {
    navigate('/statistics');
  };

  const navigateToSocial = () => {
    navigate('/social');
  };

  const navigateToSettings = () => {
    navigate('/settings');
  };

  const handleOpenAddAccountDialog = () => {
    setAddAccountDialogOpen(true);
  };

  const handleCloseAddAccountDialog = () => {
    setAddAccountDialogOpen(false);
    setNewAccount({
      name: '',
      type: 'checking',
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

  const handleAddAccount = () => {
    // Basic validation
    if (!newAccount.name || !newAccount.balance) {
      alert('Please fill all required fields');
      return;
    }

    // Add new account
    const accountIcons = {
      checking: <AccountBalanceIcon />,
      credit: <CreditCardIcon />,
      savings: <SavingsIcon />
    };

    const newAccountObj = {
      id: accounts.length + 1,
      ...newAccount,
      balance: parseFloat(newAccount.balance),
      icon: accountIcons[newAccount.type]
    };

    // Add additional properties based on account type
    if (newAccount.type === 'credit') {
      newAccountObj.limit = 5000;
      newAccountObj.usedPercentage = (parseFloat(newAccount.balance) / 5000) * 100;
      newAccountObj.dueDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10);
    } else if (newAccount.type === 'savings') {
      newAccountObj.interest = 2.5;
      newAccountObj.lastInterestDate = new Date().toISOString().slice(0, 10);
      newAccountObj.goal = parseFloat(newAccount.balance) * 2;
      newAccountObj.goalDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);
    } else {
      newAccountObj.income = 0;
      newAccountObj.expenses = 0;
      newAccountObj.savingsGoal = parseFloat(newAccount.balance) * 2;
      newAccountObj.savingsProgress = parseFloat(newAccount.balance);
    }

    setAccounts([...accounts, newAccountObj]);
    handleCloseAddAccountDialog();
  };

  return (
    <Box className="accounts-container">
      {/* Sidebar */}
      <Box className="sidebar">
        <HomeIcon className="sidebar-icon" onClick={navigateToDashboard} />
        <ShowChartIcon className="sidebar-icon" onClick={navigateToStatistics} />
        <AccountBalanceWalletIcon className="sidebar-icon" sx={{ backgroundColor: '#d1c4e9' }} />
        <PeopleIcon className="sidebar-icon" onClick={navigateToSocial} />
        <SettingsIcon className="sidebar-icon" onClick={navigateToSettings} />
      </Box>

      {/* Main Content */}
      <Box className="accounts-main-content">
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
                </Typography>
                <IconButton size="small">
                  <EditIcon />
                </IconButton>
              </Box>

              <Typography className="account-balance">
                {account.balance} {account.currency}
              </Typography>

              {account.type === 'checking' && (
                <>
                  <Box className="account-details">
                    <Box className="account-detail">
                      <Typography className="detail-label">Income</Typography>
                      <Typography className="detail-value">{account.income} {account.currency}</Typography>
                    </Box>
                    <Box className="account-detail">
                      <Typography className="detail-label">Expenses</Typography>
                      <Typography className="detail-value">{account.expenses} {account.currency}</Typography>
                    </Box>
                    <Box className="account-detail">
                      <Typography className="detail-label">Net</Typography>
                      <Typography className="detail-value">{account.income - account.expenses} {account.currency}</Typography>
                    </Box>
                  </Box>

                  <Box className="account-progress">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Savings Goal</Typography>
                      <Typography variant="body2">{account.savingsProgress}/{account.savingsGoal} {account.currency}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(account.savingsProgress / account.savingsGoal) * 100}
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                  </Box>
                </>
              )}

              {account.type === 'credit' && (
                <>
                  <Box className="account-details">
                    <Box className="account-detail">
                      <Typography className="detail-label">Credit Limit</Typography>
                      <Typography className="detail-value">{account.limit} {account.currency}</Typography>
                    </Box>
                    <Box className="account-detail">
                      <Typography className="detail-label">Used</Typography>
                      <Typography className="detail-value">{account.usedPercentage}%</Typography>
                    </Box>
                    <Box className="account-detail">
                      <Typography className="detail-label">Due Date</Typography>
                      <Typography className="detail-value">{account.dueDate}</Typography>
                    </Box>
                  </Box>

                  <Box className="account-progress">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Credit Used</Typography>
                      <Typography variant="body2">{Math.abs(account.balance)}/{account.limit} {account.currency}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={account.usedPercentage}
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                  </Box>
                </>
              )}

              {account.type === 'savings' && (
                <>
                  <Box className="account-details">
                    <Box className="account-detail">
                      <Typography className="detail-label">Interest Rate</Typography>
                      <Typography className="detail-value">{account.interest}%</Typography>
                    </Box>
                    <Box className="account-detail">
                      <Typography className="detail-label">Last Interest</Typography>
                      <Typography className="detail-value">{account.lastInterestDate}</Typography>
                    </Box>
                    <Box className="account-detail">
                      <Typography className="detail-label">Goal Date</Typography>
                      <Typography className="detail-value">{account.goalDate}</Typography>
                    </Box>
                  </Box>

                  <Box className="account-progress">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Goal Progress</Typography>
                      <Typography variant="body2">{account.balance}/{account.goal} {account.currency}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(account.balance / account.goal) * 100}
                      sx={{ height: 8, borderRadius: 5 }}
                    />
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

        {/* Linked Bank Accounts */}
        <Box className="linked-accounts-section">
          <Typography variant="h5" className="linked-accounts-title">
            Linked Bank Accounts
          </Typography>

          {linkedBanks.map(bank => (
            <Box key={bank.id} className="linked-account-item">
              <Box className="linked-account-name">
                <Box className="bank-icon">
                  <AccountBalanceIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography>{bank.name}</Typography>
              </Box>
              <Box className="linked-account-status">
                <Typography>{bank.status}</Typography>
              </Box>
            </Box>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Link a New Bank
          </Button>
        </Box>
      </Box>

      {/* Add Account Dialog */}
      <Dialog open={isAddAccountDialogOpen} onClose={handleCloseAddAccountDialog} fullWidth maxWidth="sm">
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
                <MenuItem value="checking">Checking Account</MenuItem>
                <MenuItem value="credit">Credit Card</MenuItem>
                <MenuItem value="savings">Savings Account</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="balance"
              label={newAccount.type === 'credit' ? 'Current Balance (negative for debt)' : 'Current Balance'}
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
          <Button onClick={handleCloseAddAccountDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddAccount} color="primary" variant="contained">
            Add Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounts; 