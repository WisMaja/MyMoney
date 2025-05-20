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
import { addExpense } from '../services/transactionService';
import { ensureDefaultWallet } from '../services/walletService';

const AddExpenseDialog = ({ open, onClose, onSave }) => {
  const [expense, setExpense] = useState({
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState(
    localStorage.getItem('defaultWalletId') || ''
  );

  // Fetch wallets on component mount
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        // Ensure user has a default wallet
        await ensureDefaultWallet();
        setSelectedWalletId(localStorage.getItem('defaultWalletId'));
      } catch (err) {
        console.error('Error fetching wallets:', err);
        
        // Use a mock wallet as fallback
        const mockWalletId = '00000000-0000-0000-0000-000000000000';
        localStorage.setItem('defaultWalletId', mockWalletId);
        setSelectedWalletId(mockWalletId);
        
        // Don't show error message when using fallback
        // setError('Unable to load wallet. Please try again or contact support.');
      }
    };

    fetchWallets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWalletChange = (e) => {
    setSelectedWalletId(e.target.value);
  };

  const handleSubmit = async () => {
    // Validate input
    if (!expense.amount || expense.amount <= 0) {
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
      const expenseData = {
        walletId: selectedWalletId,
        amount: Number(expense.amount),
        description: expense.description,
        category: expense.category,
        date: expense.date
      };

      console.log("Sending expense with date:", expense.date);

      // Send data to the API
      const result = await addExpense(expenseData);
      
      // Call the parent component's callback with the local representation of the data
      onSave({
        ...expense,
        amount: Number(expense.amount),
        date: new Date(expense.date).toISOString()
      });
      
      // Reset form
      setExpense({
        amount: '',
        category: 'food',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
      setError(err.response?.data?.message || 'Error saving expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              autoFocus
              name="amount"
              label="Amount ($)"
              type="number"
              value={expense.amount}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />
            
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="expense-category-label">Category</InputLabel>
              <Select
                labelId="expense-category-label"
                name="category"
                value={expense.category}
                label="Category"
                onChange={handleChange}
              >
                <MenuItem value="food">Food & Groceries</MenuItem>
                <MenuItem value="housing">Housing & Utilities</MenuItem>
                <MenuItem value="transportation">Transportation</MenuItem>
                <MenuItem value="entertainment">Entertainment</MenuItem>
                <MenuItem value="health">Healthcare</MenuItem>
                <MenuItem value="clothing">Clothing</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              name="description"
              label="Description"
              value={expense.description}
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
              value={expense.date}
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

export default AddExpenseDialog; 