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
import { updateIncome, updateExpense } from '../services/transactionService';
import { getWalletById } from '../services/walletService';

const EditTransactionDialog = ({ open, onClose, onSave, transaction }) => {
  const isIncome = transaction?.type === 'income';
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletCurrency, setWalletCurrency] = useState('USD');

  // Convert currency code to symbol
  const getCurrencySymbol = (currencyCode) => {
    const currencySymbols = {
      'USD': '$',
      'EUR': '€',
      'PLN': 'zł',
      'GBP': '£'
    };
    return currencySymbols[currencyCode] || currencyCode;
  };

  useEffect(() => {
    if (transaction) {
      // Format date to YYYY-MM-DD for input field
      const formattedDate = transaction.date.toISOString().split('T')[0];
      
      setFormData({
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description || '',
        date: formattedDate
      });

      // Fetch wallet currency
      const fetchWalletCurrency = async () => {
        try {
          if (transaction.walletId) {
            const wallet = await getWalletById(transaction.walletId);
            setWalletCurrency(wallet.currency);
          }
        } catch (err) {
          console.error('Error fetching wallet currency:', err);
          // Keep default USD if error
        }
      };

      fetchWalletCurrency();
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate input
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for the API
      const transactionData = {
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date
      };

      // Determine if it's income or expense update
      if (isIncome) {
        await updateIncome(transaction.id, transactionData);
      } else {
        await updateExpense(transaction.id, transactionData);
      }
      
      // Call parent's onSave callback
      onSave();
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err.response?.data?.message || 'Error updating transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare category options based on transaction type
  const categoryOptions = isIncome
    ? [
        { value: 'salary', label: 'Salary' },
        { value: 'investment', label: 'Investment' },
        { value: 'gift', label: 'Gift' },
        { value: 'other', label: 'Other' }
      ]
    : [
        { value: 'food', label: 'Food & Groceries' },
        { value: 'housing', label: 'Housing & Utilities' },
        { value: 'transportation', label: 'Transportation' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'health', label: 'Healthcare' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'education', label: 'Education' },
        { value: 'other', label: 'Other' }
      ];

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit {isIncome ? 'Income' : 'Expense'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              autoFocus
              name="amount"
              label={`Amount (${getCurrencySymbol(walletCurrency)})`}
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />
            
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="transaction-category-label">Category</InputLabel>
              <Select
                labelId="transaction-category-label"
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleChange}
              >
                {categoryOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              name="description"
              label="Description"
              value={formData.description}
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
              value={formData.date}
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
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
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

export default EditTransactionDialog; 