import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  MenuItem,
  InputAdornment,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import '../styles/Budgets.css';

const BudgetDialog = ({ open, onClose, onSave, budget = null, title }) => {
  const [budgetData, setBudgetData] = useState({
    name: '',
    amount: '',
    startDate: '',
    endDate: '',
    category: 'general',
    description: ''
  });

  useEffect(() => {
    if (budget) {
      setBudgetData({
        name: budget.name || '',
        amount: budget.amount || '',
        startDate: budget.startDate || '',
        endDate: budget.endDate || '',
        category: budget.category || 'general',
        description: budget.description || ''
      });
    } else {
      // Set default dates for new budget
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setBudgetData({
        name: '',
        amount: '',
        startDate: today.toISOString().split('T')[0],
        endDate: nextMonth.toISOString().split('T')[0],
        category: 'general',
        description: ''
      });
    }
  }, [budget, open]);

  const handleChange = (e) => {
    setBudgetData({
      ...budgetData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    onSave(budgetData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Budget Name"
          name="name"
          value={budgetData.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Budget Amount"
          name="amount"
          type="number"
          value={budgetData.amount}
          onChange={handleChange}
          margin="normal"
          required
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={budgetData.startDate}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="date"
              value={budgetData.endDate}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        <FormControl fullWidth margin="normal">
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            name="category"
            value={budgetData.category}
            onChange={handleChange}
            label="Category"
          >
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="housing">Housing</MenuItem>
            <MenuItem value="food">Food</MenuItem>
            <MenuItem value="transportation">Transportation</MenuItem>
            <MenuItem value="entertainment">Entertainment</MenuItem>
            <MenuItem value="healthcare">Healthcare</MenuItem>
            <MenuItem value="education">Education</MenuItem>
            <MenuItem value="travel">Travel</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={budgetData.description}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!budgetData.name || !budgetData.amount || !budgetData.startDate || !budgetData.endDate}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ShareBudgetDialog = ({ open, onClose, budgetId }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleShare = async () => {
    if (!email) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Here you would call your API to share the budget
      // For now we'll simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to share budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Share Budget</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="User Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          type="email"
          placeholder="Enter email address to share with"
          disabled={loading}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>Budget shared successfully!</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleShare} 
          variant="contained" 
          color="primary"
          disabled={!email || loading}
        >
          {loading ? 'Sharing...' : 'Share'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('Create Budget');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);

  // Dummy data for demonstration
  useEffect(() => {
    const fetchBudgets = async () => {
      // Here you would fetch budgets from your API
      // For now, let's use dummy data
      const dummyBudgets = [
        {
          id: 1,
          name: 'Monthly Expenses',
          amount: 2000,
          spent: 1200,
          startDate: '2023-06-01',
          endDate: '2023-06-30',
          category: 'general',
          description: 'Budget for regular monthly expenses',
          isShared: true,
          members: ['john@example.com', 'anna@example.com']
        },
        {
          id: 2,
          name: 'Vacation Fund',
          amount: 5000,
          spent: 1500,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          category: 'travel',
          description: 'Saving for summer vacation',
          isShared: false,
          members: []
        },
        {
          id: 3,
          name: 'Home Renovation',
          amount: 10000,
          spent: 3500,
          startDate: '2023-04-01',
          endDate: '2023-09-30',
          category: 'housing',
          description: 'Budget for kitchen renovation',
          isShared: true,
          members: ['mark@example.com']
        }
      ];
      
      setBudgets(dummyBudgets);
    };
    
    fetchBudgets();
  }, []);

  const handleCreateBudget = () => {
    setCurrentBudget(null);
    setDialogTitle('Create Budget');
    setOpenDialog(true);
  };

  const handleEditBudget = (budget) => {
    setCurrentBudget(budget);
    setDialogTitle('Edit Budget');
    setOpenDialog(true);
  };

  const handleDeleteBudget = (budgetId) => {
    // Here you would delete the budget via API
    setBudgets(budgets.filter(budget => budget.id !== budgetId));
    setAlert({
      open: true,
      message: 'Budget deleted successfully',
      severity: 'success'
    });
  };

  const handleOpenShareDialog = (budgetId) => {
    setSelectedBudgetId(budgetId);
    setOpenShareDialog(true);
  };

  const handleSaveBudget = (budgetData) => {
    if (currentBudget) {
      // Update existing budget
      const updatedBudgets = budgets.map(budget => 
        budget.id === currentBudget.id 
          ? { ...budget, ...budgetData } 
          : budget
      );
      setBudgets(updatedBudgets);
      setAlert({
        open: true,
        message: 'Budget updated successfully',
        severity: 'success'
      });
    } else {
      // Create new budget
      const newBudget = {
        id: Date.now(), // Using timestamp as temporary ID
        ...budgetData,
        spent: 0,
        isShared: false,
        members: []
      };
      setBudgets([...budgets, newBudget]);
      setAlert({
        open: true,
        message: 'Budget created successfully',
        severity: 'success'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Calculate percentage spent
  const calculatePercentage = (spent, total) => {
    return (spent / total) * 100;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box className="page-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box className="page-content">
        {/* Header */}
        <Box className="budget-header">
          <Typography variant="h4" component="h1">
            Budget Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateBudget}
          >
            Create Budget
          </Button>
        </Box>

        {/* Budgets Grid */}
        <Grid container spacing={3} className="budget-grid">
          {budgets.length === 0 ? (
            <Grid item xs={12}>
              <Box className="no-budgets">
                <Typography variant="h6" color="textSecondary" align="center">
                  No budgets found. Create your first budget to get started!
                </Typography>
              </Box>
            </Grid>
          ) : (
            budgets.map(budget => (
              <Grid item xs={12} sm={6} md={4} key={budget.id}>
                <Card className="budget-card">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" className="budget-name">
                        {budget.name}
                      </Typography>
                      <Chip 
                        label={budget.category} 
                        size="small" 
                        className={`category-chip ${budget.category}`}
                      />
                    </Box>
                    
                    <Box mt={2} mb={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Budget:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formatCurrency(budget.amount)}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Spent:
                        </Typography>
                        <Typography variant="body1">
                          {formatCurrency(budget.spent)}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">
                          Remaining:
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color={budget.spent > budget.amount ? 'error' : 'success.main'}
                        >
                          {formatCurrency(budget.amount - budget.spent)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box mt={2}>
                      <Typography variant="body2" color="textSecondary">
                        {calculatePercentage(budget.spent, budget.amount).toFixed(0)}% spent
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(calculatePercentage(budget.spent, budget.amount), 100)} 
                        color={
                          calculatePercentage(budget.spent, budget.amount) > 90 ? "error" : 
                          calculatePercentage(budget.spent, budget.amount) > 75 ? "warning" : "primary"
                        }
                        sx={{ height: 10, borderRadius: 5, mt: 1 }}
                      />
                    </Box>
                    
                    {budget.description && (
                      <Typography variant="body2" color="textSecondary" mt={2}>
                        {budget.description}
                      </Typography>
                    )}
                    
                    <Box mt={2} display="flex" alignItems="center">
                      <Typography variant="body2" color="textSecondary">
                        {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                      </Typography>
                      
                      {budget.isShared && (
                        <Tooltip title={`Shared with ${budget.members.join(', ')}`}>
                          <Box display="flex" alignItems="center" ml={2}>
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="textSecondary" ml={0.5}>
                              {budget.members.length}
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditBudget(budget)}
                      aria-label="Edit budget"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteBudget(budget.id)}
                      aria-label="Delete budget"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenShareDialog(budget.id)}
                      aria-label="Share budget"
                    >
                      <ShareIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Dialogs */}
        <BudgetDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSave={handleSaveBudget}
          budget={currentBudget}
          title={dialogTitle}
        />

        <ShareBudgetDialog
          open={openShareDialog}
          onClose={() => setOpenShareDialog(false)}
          budgetId={selectedBudgetId}
        />

        {/* Snackbar for alerts */}
        <Snackbar 
          open={alert.open} 
          autoHideDuration={6000} 
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Budgets; 