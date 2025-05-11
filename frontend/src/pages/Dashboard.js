import React, { useState } from 'react';
import { Box, Typography, Button, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEffect } from 'react';
import AddIncomeDialog from '../components/AddIncomeDialog';
import AddExpenseDialog from '../components/AddExpenseDialog';
import Sidebar from '../components/Sidebar';
import { supabase } from '../supabaseClient'; 
import '../styles/Dashboard.css';

const Dashboard = () => {
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (user) {
        const { full_name } = user.user_metadata || {};
  
        setUserData((prev) => ({
          ...prev,
          name: full_name ? `${full_name}` : user.email, 
        }));
      }
    };
  
    fetchUserData();
  }, []);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: 'John Doe',
    mainAccount: 200,
    incomes: 400,
    expenses: 200
  });
  
  const [isIncomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const handleAddIncome = () => {
    setIncomeDialogOpen(true);
  };

  const handleAddExpense = () => {
    setExpenseDialogOpen(true);
  };

  const handleSaveIncome = (incomeData) => {
    // Update user data
    setUserData(prev => ({
      ...prev,
      mainAccount: prev.mainAccount + incomeData.amount,
      incomes: prev.incomes + incomeData.amount
    }));

    // Add to transactions
    setTransactions(prev => [
      {
        id: Date.now(),
        type: 'income',
        ...incomeData,
        date: new Date(incomeData.date)
      },
      ...prev
    ]);
  };

  const handleSaveExpense = (expenseData) => {
    // Update user data
    setUserData(prev => ({
      ...prev,
      mainAccount: prev.mainAccount - expenseData.amount,
      expenses: prev.expenses + expenseData.amount
    }));

    // Add to transactions
    setTransactions(prev => [
      {
        id: Date.now(),
        type: 'expense',
        ...expenseData,
        date: new Date(expenseData.date)
      },
      ...prev
    ]);
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
              {userData.mainAccount}<span className="currency">$</span>
            </Typography>
          </Box>
          
          <Box className="finance-card">
            <Typography className="card-title">
              Incomes
            </Typography>
            <Typography className="card-amount">
              {userData.incomes}<span className="currency">$</span>
            </Typography>
          </Box>
          
          <Box className="finance-card">
            <Typography className="card-title">
              Expenses
            </Typography>
            <Typography className="card-amount">
              {userData.expenses}<span className="currency">$</span>
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
            {transactions.length === 0 ? (
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
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount} $
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