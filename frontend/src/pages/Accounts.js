import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Avatar, IconButton, LinearProgress, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select,
  FormControl, InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import Sidebar from '../components/Sidebar';
import AddIncomeDialog from '../components/AddIncomeDialog';
import AddExpenseDialog from '../components/AddExpenseDialog';
import { getAllWallets, createWallet,deleteWallet, getWalletBalance } from '../services/walletService';
import '../styles/Accounts.css';

const Accounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIncomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [isAddAccountDialogOpen, setAddAccountDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    balance: '',
    currency: '$'
  });

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      const wallets = await getAllWallets();

      // Fetch balances for all wallets
      const walletsWithBalances = await Promise.all(
          wallets.map(async (w) => {
            const balanceData = await getWalletBalance(w.id);
            return {
              ...w,
              type: 'checking',
              balance: balanceData.currentBalance,
              currency: w.currency,
              icon: <AccountBalanceIcon />,
              income: w.income || 0,
              expenses: w.expenses || 0
            };
          })
      );

      setAccounts(walletsWithBalances);
    } catch (error) {
      console.error('Error fetching wallets or balances:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteAccount = async (walletId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    try {
      await deleteWallet(walletId);
      fetchWallets(); // odśwież listę po usunięciu
    } catch (error) {
      console.error('Error deleting wallet:', error);
    }
  };


  const handleAddIncome = (walletId) => {
    setSelectedWalletId(walletId);
    setIncomeDialogOpen(true);
  };

  const handleAddExpense = (walletId) => {
    setSelectedWalletId(walletId);
    setExpenseDialogOpen(true);
  };

  const handleOpenAddAccountDialog = () => {
    setAddAccountDialogOpen(true);
  };

  const handleCloseAddAccountDialog = () => {
    setAddAccountDialogOpen(false);
    setNewAccount({ name: '', type: 'checking', balance: '', currency: '$' });
  };

  const handleNewAccountChange = (e) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.balance) {
      alert('Please fill all required fields');
      return;
    }
    try {
      await createWallet({
        name: newAccount.name,
        currency: newAccount.currency,
        initialBalance: newAccount.balance
      });
      handleCloseAddAccountDialog();
      fetchWallets();
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  return (
      <Box className="page-container">
        <Sidebar />
        <Box className="page-content">
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

          <Box className="accounts-list">
            {isLoading ? (
                <Typography>Loading wallets...</Typography>
            ) : accounts.length === 0 ? (
                <Typography>No wallets found.</Typography>
            ) : (
                accounts.map(account => (
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

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button variant="contained" color="success" onClick={() => handleAddIncome(account.id)}>
                          Add Income
                        </Button>
                        <Button variant="contained" color="error" onClick={() => handleAddExpense(account.id)}>
                          Add Expense
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleDeleteAccount(account.id)}
                        >
                          Delete Wallet
                        </Button>
                      </Box>
                    </Paper>
                ))
            )}
          </Box>
        </Box>

        <AddIncomeDialog
            open={isIncomeDialogOpen}
            onClose={() => setIncomeDialogOpen(false)}
            onSave={fetchWallets}
            walletId={selectedWalletId}
        />

        <AddExpenseDialog
            open={isExpenseDialogOpen}
            onClose={() => setExpenseDialogOpen(false)}
            onSave={fetchWallets}
            walletId={selectedWalletId}
        />

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
