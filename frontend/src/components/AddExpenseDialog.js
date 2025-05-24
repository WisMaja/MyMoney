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
import { getMainWalletId, getUserWallets } from '../services/walletService';
import { getAllCategories } from '../services/categoryService';

// Category colors
const categoryColors = [
  '#1976d2', // Blue
  '#2e7d32', // Green
  '#c62828', // Red
  '#f57c00', // Orange
  '#6a1b9a', // Purple
  '#00838f', // Teal
  '#558b2f', // Light Green
  '#d81b60', // Pink
  '#5d4037', // Brown
  '#546e7a', // Blue Grey
];

// Helper function to get default color for a category
const getDefaultCategoryColor = (categoryName) => {
  // Assign color based on hash of name for consistency
  const colorIndex = Math.abs(categoryName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % categoryColors.length;
  return categoryColors[colorIndex];
};

const AddExpenseDialog = ({ open, onClose, onSave }) => {
  const [expense, setExpense] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch wallets and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setWalletsLoading(true);
        setCategoriesLoading(true);
        
        // Get main wallet ID first
        const mainWalletId = await getMainWalletId();
        setSelectedWalletId(mainWalletId);
        
        // Get all user wallets for the selector
        const userWallets = await getUserWallets();
        setWallets(userWallets);
        
        // Get all categories
        const allCategories = await getAllCategories();
        // Filter for expense categories (type 'expense' or no type specified)
        const expenseCategories = allCategories.filter(cat => 
          cat.type === 'expense' || cat.type === 'both' || !cat.type
        );
        
        // Add colors to categories that don't have them
        const categoriesWithColors = expenseCategories.map(cat => ({
          ...cat,
          color: cat.color || getDefaultCategoryColor(cat.name)
        }));
        
        setCategories(categoriesWithColors);
        
        // Set default category if available
        if (categoriesWithColors.length > 0 && !expense.category) {
          setExpense(prev => ({
            ...prev,
            category: categoriesWithColors[0].id
          }));
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Unable to load data. Please try again.');
      } finally {
        setWalletsLoading(false);
        setCategoriesLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

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

  // Get currency symbol for the selected wallet
  const getSelectedWalletCurrency = () => {
    const selectedWallet = wallets.find(wallet => wallet.id === selectedWalletId);
    return selectedWallet ? selectedWallet.currency : 'USD';
  };

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

  const handleSubmit = async () => {
    // Validate input
    if (!expense.amount || expense.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!selectedWalletId) {
      setError('Please select an account');
      return;
    }

    if (!expense.category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for the API
      const expenseData = {
        walletId: selectedWalletId,
        amount: Number(expense.amount),
        description: expense.description,
        categoryId: expense.category, // Use categoryId instead of category name
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
        category: categories.length > 0 ? categories[0].id : '',
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
              label={`Amount (${getCurrencySymbol(getSelectedWalletCurrency())})`}
              type="number"
              value={expense.amount}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />
            
            <FormControl fullWidth disabled={loading || categoriesLoading}>
              <InputLabel id="expense-category-label">Category</InputLabel>
              <Select
                labelId="expense-category-label"
                name="category"
                value={expense.category}
                label="Category"
                onChange={handleChange}
              >
                {categoriesLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading categories...
                  </MenuItem>
                ) : (
                  categories.map((category) => (
                    <MenuItem key={category.id} value={category.id} sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            backgroundColor: category.color,
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {category.name.charAt(0).toUpperCase()}
                        </Box>
                        <span>{category.name}</span>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            
            <FormControl fullWidth disabled={loading}>
              <InputLabel id="wallet-select-label">Account</InputLabel>
              <Select
                labelId="wallet-select-label"
                value={selectedWalletId}
                label="Account"
                onChange={handleWalletChange}
              >
                {walletsLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading accounts...
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
            disabled={loading || walletsLoading || !selectedWalletId}
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