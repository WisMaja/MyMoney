import React, { useState } from 'react';
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
  Box
} from '@mui/material';

const AddExpenseDialog = ({ open, onClose, onSave }) => {
  const [expense, setExpense] = useState({
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validate input
    if (!expense.amount || expense.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Submit form
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
  };

  return (
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
          />
          
          <FormControl fullWidth>
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
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExpenseDialog; 