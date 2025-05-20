import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getAllTransactions } from '../services/transactionService';
import { formatCurrency } from '../utils/formatters';
import AddExpenseDialog from './AddExpenseDialog';
import AddIncomeDialog from './AddIncomeDialog';
import EditTransactionDialog from './EditTransactionDialog';
import DeleteTransactionDialog from './DeleteTransactionDialog';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [openAddIncome, setOpenAddIncome] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getAllTransactions();
      
      // Sort transactions by date in descending order (newest first)
      const sortedTransactions = data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setTransactions(sortedTransactions);
      
      // Calculate balance
      const total = data.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
          return acc + transaction.amount;
        } else {
          return acc - transaction.amount;
        }
      }, 0);
      
      setBalance(total);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Nie udało się załadować transakcji. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddExpenseClick = () => {
    setOpenAddExpense(true);
  };

  const handleAddIncomeClick = () => {
    setOpenAddIncome(true);
  };

  const handleExpenseDialogClose = () => {
    setOpenAddExpense(false);
    fetchTransactions(); // Refresh transactions list
  };

  const handleIncomeDialogClose = () => {
    setOpenAddIncome(false);
    fetchTransactions(); // Refresh transactions list
  };
  
  const handleEditClick = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenEditDialog(true);
  };
  
  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDeleteDialog(true);
  };
  
  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedTransaction(null);
  };
  
  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedTransaction(null);
  };
  
  const handleTransactionUpdated = () => {
    fetchTransactions(); // Refresh transactions list
    setOpenEditDialog(false);
    setSelectedTransaction(null);
  };
  
  const handleTransactionDeleted = () => {
    fetchTransactions(); // Refresh transactions list
    setOpenDeleteDialog(false);
    setSelectedTransaction(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="md" className="dashboard-container">
      <Typography variant="h4" component="h1" gutterBottom align="center" className="dashboard-title">
        Twój budżet
      </Typography>
      
      <Paper elevation={3} className="balance-paper">
        <Typography variant="h5" component="h2" gutterBottom>
          Saldo
        </Typography>
        <Typography variant="h4" component="p" className={balance >= 0 ? 'positive-balance' : 'negative-balance'}>
          {formatCurrency(balance)}
        </Typography>
      </Paper>
      
      <Box mt={4} mb={2} display="flex" justifyContent="space-around">
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddIncomeClick}
          className="action-button income-button"
        >
          Dodaj przychód
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAddExpenseClick}
          className="action-button expense-button"
        >
          Dodaj wydatek
        </Button>
      </Box>
      
      <Paper elevation={3} className="transactions-paper">
        <Typography variant="h5" component="h2" gutterBottom className="transactions-title">
          Historia transakcji
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : transactions.length === 0 ? (
          <Typography align="center" className="no-transactions">
            Brak transakcji do wyświetlenia
          </Typography>
        ) : (
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <React.Fragment key={transaction.id}>
                <Box className={`transaction-item ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                  <Box className="transaction-main">
                    <Box className="transaction-info">
                      <Typography variant="subtitle1" className="transaction-description">
                        {transaction.description}
                      </Typography>
                      <Typography variant="body2" className="transaction-category">
                        {transaction.category.name}
                      </Typography>
                      <Typography variant="body2" className="transaction-date">
                        {formatDate(transaction.createdAt)}
                      </Typography>
                    </Box>
                    <Box className="transaction-amount-section">
                      <Typography variant="h6" className="transaction-amount">
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </Typography>
                      <Box className="transaction-actions">
                        <Tooltip title="Edytuj">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditClick(transaction)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Usuń">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteClick(transaction)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Divider />
              </React.Fragment>
            ))}
          </div>
        )}
      </Paper>
      
      <AddExpenseDialog open={openAddExpense} handleClose={handleExpenseDialogClose} />
      <AddIncomeDialog open={openAddIncome} handleClose={handleIncomeDialogClose} />
      
      {selectedTransaction && (
        <>
          <EditTransactionDialog 
            open={openEditDialog} 
            handleClose={handleEditDialogClose}
            transaction={selectedTransaction}
            onUpdateSuccess={handleTransactionUpdated}
          />
          <DeleteTransactionDialog
            open={openDeleteDialog}
            handleClose={handleDeleteDialogClose}
            transaction={selectedTransaction}
            onDeleteSuccess={handleTransactionDeleted}
          />
        </>
      )}
    </Container>
  );
};

export default Dashboard; 