import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalance from '@mui/icons-material/AccountBalance';
import CreditCard from '@mui/icons-material/CreditCard';
import Savings from '@mui/icons-material/Savings';
import AddIncomeDialog from '../components/AddIncomeDialog';
import AddExpenseDialog from '../components/AddExpenseDialog';
import EditTransactionDialog from '../components/EditTransactionDialog';
import Sidebar from '../components/Sidebar';
import '../styles/Dashboard.css';
import { getAllTransactions, getIncomeTransactions, getExpenseTransactions, deleteTransaction } from '../services/transactionService';
import { getMainWallet } from '../services/walletService';

const Dashboard = () => {

  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: 'John Doe',
    mainAccount: 0,
    incomes: 0,
    expenses: 0,
    mainAccountName: 'Main Account',
    mainAccountCurrency: '$',
    mainAccountType: 'Personal'
  });
  
  const [isIncomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // Fetch transactions and main wallet on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch main wallet info
      const mainWallet = await getMainWallet();
      
      // Fetch transactions
      await fetchTransactions();
      
      // Update user data with main wallet info
      setUserData(prev => ({
        ...prev,
        mainAccountName: mainWallet.name,
        mainAccountCurrency: mainWallet.currency,
        mainAccountType: mainWallet.type
      }));
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Get all transactions
      const allTransactions = await getAllTransactions();
      
      // Transform transactions to the format expected by the UI
      const formattedTransactions = allTransactions.map(transaction => ({
        id: transaction.id,
        type: transaction.amount > 0 ? 'income' : 'expense',
        amount: Math.abs(transaction.amount),
        description: transaction.description || 'No description',
        category: transaction.category?.name || 'Uncategorized',
        categoryId: transaction.categoryId,
        date: new Date(transaction.createdAt),
        walletId: transaction.walletId,
        // Zachowujemy surowe dane, które będą potrzebne dla dialogu edycji
        originalData: transaction
      }));
      
      // Sort transactions chronologically - newest first
      formattedTransactions.sort((a, b) => b.date - a.date);
      
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
    }
  };

  const handleAddIncome = () => {
    setIncomeDialogOpen(true);
  };

  const handleAddExpense = () => {
    setExpenseDialogOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setConfirmDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteTransaction(transactionToDelete.id);
      await fetchTransactions(); // Refresh data
      setConfirmDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      // Możemy dodać obsługę błędów tutaj, np. pokazanie komunikatu
    } finally {
      setDeleteLoading(false);
      setTransactionToDelete(null);
    }
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

  const handleSaveEdit = async () => {
    // Refresh transactions after edit is saved
    await fetchTransactions();
    setEditDialogOpen(false);
    setSelectedTransaction(null);
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

  // Helper function to render account icon
  const renderAccountTypeIcon = () => {
    switch (userData.mainAccountType) {
      case 'Credit':
        return <CreditCard sx={{ mr: 1, color: 'primary.main' }} />;
      case 'Savings':
        return <Savings sx={{ mr: 1, color: 'primary.main' }} />;
      case 'Personal':
      default:
        return <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />;
    }
  };

  if (loading) {
    return (
      <Box className="page-container">
        <Sidebar />
        <Box className="page-content" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {renderAccountTypeIcon()}
                {userData.mainAccountName}
              </Box>
            </Typography>
            <Typography className="card-amount">
              {userData.mainAccount.toFixed(2)}<span className="currency">{userData.mainAccountCurrency}</span>
            </Typography>
            <Button 
              variant="text" 
              size="small"
              onClick={navigateToAccounts}
              sx={{ mt: 1, fontSize: '0.75rem' }}
            >
              Change Main Account
            </Button>
          </Box>
          
          <Box className="finance-card">
            <Typography className="card-title">
              Incomes
            </Typography>
            <Typography className="card-amount">
              {userData.incomes.toFixed(2)}<span className="currency">{userData.mainAccountCurrency}</span>
            </Typography>
          </Box>
          
          <Box className="finance-card">
            <Typography className="card-title">
              Expenses
            </Typography>
            <Typography className="card-amount">
              {userData.expenses.toFixed(2)}<span className="currency">{userData.mainAccountCurrency}</span>
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
                      {transaction.date.toLocaleDateString()} - {transaction.category}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: transaction.type === 'income' ? 'green' : 'red',
                        mr: 2
                      }}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} {userData.mainAccountCurrency}
                    </Typography>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditTransaction(transaction)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(transaction)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
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
      
      {selectedTransaction && (
        <EditTransactionDialog
          open={isEditDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveEdit}
          transaction={selectedTransaction}
        />
      )}
      
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={() => setConfirmDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {transactionToDelete?.type}?
          </Typography>
          {transactionToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {transactionToDelete.description}
              </Typography>
              <Typography variant="body2">
                Amount: {transactionToDelete.type === 'income' ? '+' : '-'}{transactionToDelete.amount.toFixed(2)} {userData.mainAccountCurrency}
              </Typography>
              <Typography variant="body2">
                Date: {transactionToDelete.date.toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 