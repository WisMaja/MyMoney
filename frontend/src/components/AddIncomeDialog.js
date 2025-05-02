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

const AddIncomeDialog = ({ open, onClose, onSave }) => {
  const [income, setIncome] = useState({
    amount: '',
    category: 'salary',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIncome(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validate input
    if (!income.amount || income.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Submit form
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
  };

  return (
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
          />
          
          <FormControl fullWidth>
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
          
          <TextField
            name="description"
            label="Description"
            value={income.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
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

export default AddIncomeDialog; 