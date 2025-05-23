import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { addIncome } from '../services/transactionService';
import { ensureDefaultWallet, getUserWallets, getMainWallet } from '../services/walletService';

const AddIncomeDialog = ({ open, onClose, onSave }) => {
  const [income, setIncome] = useState({
    amount: '',
    category: 'salary',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [walletsLoading, setWalletsLoading] = useState(true);

  // Fetch wallets on component mount
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setWalletsLoading(true);
        
        // Get main wallet and all user wallets
        const [mainWallet, userWallets] = await Promise.all([
          getMainWallet(),
          getUserWallets()
        ]);
        
        setWallets(userWallets);
        setSelectedWalletId(mainWallet?.id || '');
        
      } catch (err) {
        console.error('Error fetching wallets:', err);
        
        // Fallback to ensure default wallet
        try {
          const defaultWallet = await ensureDefaultWallet();
          setWallets([defaultWallet]);
          setSelectedWalletId(defaultWallet.id);
        } catch (fallbackErr) {
          console.error('Error with fallback wallet:', fallbackErr);
          setError('Unable to load wallets. Please try again.');
        }
      } finally {
        setWalletsLoading(false);
      }
    };

    if (open) {
      fetchWallets();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIncome(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWalletChange = (e) => {
    setSelectedWalletId(e.target.value);
  };

  const handleSubmit = async () => {
    // Validate input
    if (!income.amount || income.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Ensure valid wallet ID
    if (!selectedWalletId) {
      try {
        const wallet = await ensureDefaultWallet();
        setSelectedWalletId(wallet.id);
      } catch (err) {
        setError('Could not set up a wallet. Please try again.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for the API
      const incomeData = {
        walletId: selectedWalletId,
        amount: Number(income.amount),
        description: income.description,
        category: income.category,
        date: income.date
      };

      console.log("Sending income with date:", income.date);

      // Send data to the API
      const result = await addIncome(incomeData);
      
      // Call the parent component's callback with the local representation of the data
      onSave({
        ...income,
        amount: Number(income.amount),
        date: new Date(income.date).toISOString()
      });
      
      // Reset form
      setIncome({
        amount: '',
        category: 'salary',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      onClose();
    } catch (err) {
      console.error('Error saving income:', err);
      setError(err.response?.data?.message || 'Error saving income. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Income</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              autoFocus
              name="amount"
              label="Amount ($)"
              type="number"
              value={income.amount}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />
            
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="income-category-label">Category</InputLabel>
              <Select
                labelId="income-category-label"
                name="category"
                value={income.category}
                label="Category"
                onChange={handleChange}
              >
                <MenuItem value="salary">Salary</MenuItem>
                <MenuItem value="investment">Investment</MenuItem>
                <MenuItem value="gift">Gift</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth disabled={loading || walletsLoading}>
              <InputLabel id="wallet-select-label">Account</InputLabel>
              <Select
                labelId="wallet-select-label"
                value={selectedWalletId}
                label="Account"
                onChange={handleWalletChange}
              >
                {walletsLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} /> Loading accounts...
                  </MenuItem>
                ) : (
                  wallets.map((wallet) => (
                    <MenuItem key={wallet.id} value={wallet.id}>
                      {wallet.name} ({wallet.currency})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            
            <TextField
              name="description"
              label="Description"
              value={income.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              disabled={loading}
            />
            
            <TextField
              name="date"
              label="Date"
              type="date"
              value={income.date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary" disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default AddIncomeDialog; 