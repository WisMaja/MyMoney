import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  CircularProgress
} from '@mui/material';
import { deleteTransaction } from '../services/transactionService';

const DeleteTransactionDialog = ({ open, handleClose, transaction, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Format the amount and type for display
  const formattedAmount = transaction ? 
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(transaction.amount) : '';
  const transactionType = transaction?.type === 'expense' ? 'wydatek' : 'przychód';

  const handleDelete = async () => {
    if (!transaction || !transaction.id) {
      setError('Brak danych transakcji do usunięcia');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await deleteTransaction(transaction.id);
      
      // Call the success callback
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      
      // Close the dialog
      handleClose();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(
        err.response?.data?.message || 
        'Wystąpił błąd podczas usuwania transakcji. Spróbuj ponownie.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      aria-labelledby="delete-transaction-dialog-title"
    >
      <DialogTitle id="delete-transaction-dialog-title">
        Potwierdź usunięcie
      </DialogTitle>
      <DialogContent>
        {transaction && (
          <DialogContentText>
            Czy na pewno chcesz usunąć {transactionType} <strong>{transaction.description}</strong> o wartości <strong>{formattedAmount}</strong>?
            <br />
            Ta operacja jest nieodwracalna.
          </DialogContentText>
        )}
        {error && (
          <DialogContentText color="error" sx={{ mt: 2 }}>
            {error}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="primary"
          disabled={isDeleting}
        >
          Anuluj
        </Button>
        <Button 
          onClick={handleDelete} 
          color="error" 
          variant="contained"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={24} color="inherit" /> : null}
        >
          {isDeleting ? 'Usuwanie...' : 'Usuń'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTransactionDialog; 