import apiClient from '../apiClient';
import { getCategoryIdByName } from './categoryService';
import { getMainWalletId } from './walletService';

// Get all transactions
export const getAllTransactions = async () => {
  try {
    const response = await apiClient.get('/transactions');
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    if (error.response) {
      if (error.response.status === 401) {
        // Authentication error, redirect to login
        window.location.href = '/login';
        return;
      }
    }
    
    throw error;
  }
};

// Get income transactions
export const getIncomeTransactions = async () => {
  try {
    const response = await apiClient.get('/transactions/income');
    return response.data;
  } catch (error) {
    console.error('Error fetching income transactions:', error);
    throw error;
  }
};

// Get expense transactions
export const getExpenseTransactions = async () => {
  try {
    const response = await apiClient.get('/transactions/expenses');
    return response.data;
  } catch (error) {
    console.error('Error fetching expense transactions:', error);
    throw error;
  }
};

// Get transactions by wallet ID
export const getTransactionsByWallet = async (walletId) => {
  try {
    if (!walletId) {
      throw new Error('Wallet ID is required');
    }

    const response = await apiClient.get(`/transactions/wallet/${walletId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching transactions for wallet ${walletId}:`, error);
    throw error;
  }
};

// Add new income
export const addIncome = async (incomeData) => {
  try {
    let categoryId = incomeData.categoryId;
    
    if (!categoryId && incomeData.categoryName) {
      categoryId = await getCategoryIdByName(incomeData.categoryName);
    }

    let walletId = incomeData.walletId;
    if (!walletId) {
      walletId = await getMainWalletId();
    }

    let createdAt = incomeData.createdAt;
    if (!createdAt) {
      createdAt = new Date().toISOString();
    }

    const apiData = {
      amount: Math.abs(parseFloat(incomeData.amount)),
      description: incomeData.description || '',
      categoryId: categoryId,
      walletId: walletId,
      createdAt: createdAt
    };

    const response = await apiClient.post('/transactions/income', apiData);
    return response.data;
  } catch (error) {
    console.error('Error adding income:', error);
    throw error;
  }
};

// Add new expense
export const addExpense = async (expenseData) => {
  try {
    // Use categoryId directly if provided, otherwise get it from category name
    let categoryId;
    if (expenseData.categoryId) {
      categoryId = expenseData.categoryId;
    } else if (expenseData.category) {
      // Fallback for old format
      categoryId = await getCategoryIdByName(expenseData.category);
    } else {
      throw new Error("Either categoryId or category name must be provided");
    }
    
    // Ensure we have a valid wallet ID
    let walletId = expenseData.walletId || localStorage.getItem('defaultWalletId');
    
    // If still no wallet ID, use a default mock ID
    if (!walletId) {
      walletId = '00000000-0000-0000-0000-000000000000';
      localStorage.setItem('defaultWalletId', walletId);
    }
    
    // Parse date from the form if available
    let createdAt = null;
    if (expenseData.date) {
      createdAt = new Date(expenseData.date);
    }
    
    // We need to convert the data from the frontend format to the API format
    const apiData = {
      walletId: walletId,
      categoryId: categoryId,
      amount: parseFloat(expenseData.amount),
      description: expenseData.description || 'Expense',
      createdAt: createdAt
    };
    
    const response = await apiClient.post('/transactions/expenses', apiData);
    return response.data;
  } catch (error) {
    console.error('Error adding expense:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Update income
export const updateIncome = async (id, incomeData) => {
  try {
    // Get or create category ID based on the category name
    const categoryId = await getCategoryIdByName(incomeData.category);
    
    // Parse date if available
    let createdAt = null;
    if (incomeData.date) {
      createdAt = new Date(incomeData.date);
    }
    
    const apiData = {
      amount: parseFloat(incomeData.amount),
      categoryId: categoryId,
      description: incomeData.description || incomeData.category,
      createdAt: createdAt
    };
    
    const response = await apiClient.put(`/transactions/income/${id}`, apiData);
    return response.data;
  } catch (error) {
    console.error('Error updating income:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Update expense
export const updateExpense = async (id, expenseData) => {
  try {
    // Get or create category ID based on the category name
    const categoryId = await getCategoryIdByName(expenseData.category);
    
    // Parse date if available
    let createdAt = null;
    if (expenseData.date) {
      createdAt = new Date(expenseData.date);
    }
    
    const apiData = {
      amount: parseFloat(expenseData.amount),
      categoryId: categoryId,
      description: expenseData.description || expenseData.category,
      createdAt: createdAt
    };
    
    const response = await apiClient.put(`/transactions/expenses/${id}`, apiData);
    return response.data;
  } catch (error) {
    console.error('Error updating expense:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Delete transaction
export const deleteTransaction = async (id) => {
  try {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}; 