import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIncomeDialog from '../components/AddIncomeDialog';
import AddExpenseDialog from '../components/AddExpenseDialog';
import Sidebar from '../components/Sidebar';
import '../styles/Dashboard.css';
import { getAllTransactions, getIncomeTransactions, getExpenseTransactions } from '../services/transactionService';

const Dashboard = () => {

  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: 'John Doe',
    mainAccount: 0,
    incomes: 0,
    expenses: 0
  });
  
  const [isIncomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all transactions
      const allTransactions = await getAllTransactions();
      
      // Transform transactions to the format expected by the UI
      const formattedTransactions = allTransactions.map(transaction => ({
        id: transaction.id,
        type: transaction.amount > 0 ? 'income' : 'expense',
        amount: Math.abs(transaction.amount),
        description: transaction.description || 'No description',
        category: transaction.category?.name || 'Uncategorized',
        date: new Date(transaction.createdAt)
      }));
      
      // Calculate totals
      let totalIncome = 0;
      let totalExpense = 0;
      
      allTransactions.forEach(transaction => {
        if (transaction.amount > 0) {
          totalIncome += transaction.amount;
        } else {
          totalExpense += Math.abs(transaction.amount);
        }
      });
      
      // Update state
      setTransactions(formattedTransactions);
      setUserData(prev => ({
        ...prev,
        mainAccount: totalIncome - totalExpense,
        incomes: totalIncome,
        expenses: totalExpense
      }));
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = () => {
    setIncomeDialogOpen(true);
  };

  const handleAddExpense = () => {
    setExpenseDialogOpen(true);
  };

  const handleSaveIncome = async (incomeData) => {
    // The API call is now handled in the AddIncomeDialog component
    // Here we just refresh the transaction list
    await fetchTransactions();
  };

  const handleSaveExpense = async (expenseData) => {
    // The API call is now handled in the AddExpenseDialog component
    // Here we just refresh the transaction list
    await fetchTransactions();
  };

  const navigateToStatistics = () => {
    navigate('/statistics');
  };

  const navigateToAccounts = () => {
    navigate('/accounts');
  };

  const navigateToSocial = () => {
    navigate('/social');
  };

  const navigateToSettings = () => {
    navigate('/settings');
  };

  return (
    <Box className="page-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box className="page-content">
        {/* Header */}
        <Box className="header">
          <Typography variant="h4" component="h1" className="welcome-title">
            Welcome In Money Tracker
          </Typography>
          <Box className="user-profile">
            <Typography variant="body1">
              {userData.name}
            </Typography>
            <Avatar className="user-avatar" />
          </Box>
        </Box>

        {/* Financial Cards */}
        <Box className="cards-container">
          <Box className="finance-card">
            <Typography className="card-title">
              Main Account
            </Typography>
            <Typography className="card-amount">
              {userData.mainAccount.toFixed(2)}<span className="currency">$</span>
            </Typography>
          </Box>
          
          <Box className="finance-card">
            <Typography className="card-title">
              Incomes
            </Typography>
            <Typography className="card-amount">
              {userData.incomes.toFixed(2)}<span className="currency">$</span>
            </Typography>
          </Box>
          
          <Box className="finance-card">
            <Typography className="card-title">
              Expenses
            </Typography>
            <Typography className="card-amount">
              {userData.expenses.toFixed(2)}<span className="currency">$</span>
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box className="actions-container">
          <Button 
            variant="contained"
            className="action-button"
            onClick={handleAddIncome}
          >
            Add Income
          </Button>
          
          <Button 
            variant="contained"
            className="action-button"
            onClick={handleAddExpense}
          >
            Add Expense
          </Button>
        </Box>

        {/* Transactions Section */}
        <Box className="transactions-container">
          <Typography variant="h6" className="transactions-title">
            Recent Transactions
          </Typography>
          <Box sx={{ height: '300px', overflowY: 'auto' }}>
            {loading ? (
              <Typography variant="body1" sx={{ textAlign: 'center', color: '#666', mt: 5 }}>
                Loading transactions...
              </Typography>
            ) : error ? (
              <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="body1" sx={{ color: 'error.main', mb: 2 }}>
                  {error}
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={fetchTransactions}
                  sx={{ mt: 1 }}
                >
                  Try Again
                </Button>
              </Box>
            ) : transactions.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', color: '#666', mt: 5 }}>
                No transactions yet. Add your first income or expense!
              </Typography>
            ) : (
              transactions.map(transaction => (
                <Box 
                  key={transaction.id}
                  sx={{ 
                    p: 2, 
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {transaction.description || transaction.category}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {transaction.date.toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: transaction.type === 'income' ? 'green' : 'red'
                    }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} $
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Dialogs */}
      <AddIncomeDialog 
        open={isIncomeDialogOpen} 
        onClose={() => setIncomeDialogOpen(false)} 
        onSave={handleSaveIncome} 
      />
      
      <AddExpenseDialog 
        open={isExpenseDialogOpen} 
        onClose={() => setExpenseDialogOpen(false)} 
        onSave={handleSaveExpense} 
      />
    </Box>
  );
};

export default Dashboard; 