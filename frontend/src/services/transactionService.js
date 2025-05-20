import apiClient from '../apiClient';
import { getCategoryIdByName } from './categoryService';

// Get all transactions
export const getAllTransactions = async () => {
  try {
    console.log("Fetching all transactions...");
    const response = await apiClient.get('/transactions');
    console.log("Successfully fetched transactions:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Handle specific error codes
      if (error.response.status === 401) {
        console.log("Authentication error, redirecting to login");
        localStorage.removeItem('token');  // Clear token
        window.location.href = '/login';  // Redirect to login
        throw new Error("Session expired. Please login again.");
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
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

// Add new income
export const addIncome = async (incomeData) => {
  try {
    console.log("Starting addIncome with data:", incomeData);
    
    // Get or create category ID based on the category name
    console.log("Getting category ID for:", incomeData.category);
    const categoryId = await getCategoryIdByName(incomeData.category);
    console.log("Retrieved categoryId:", categoryId);
    
    // Ensure we have a valid wallet ID
    let walletId = incomeData.walletId || localStorage.getItem('defaultWalletId');
    console.log("Using walletId:", walletId);
    
    // If still no wallet ID, use a default mock ID
    if (!walletId) {
      walletId = '00000000-0000-0000-0000-000000000000';
      localStorage.setItem('defaultWalletId', walletId);
      console.log("No wallet ID found, using default:", walletId);
    }
    
    // We need to convert the data from the frontend format to the API format
    const apiData = {
      walletId: walletId,
      categoryId: categoryId,
      amount: parseFloat(incomeData.amount),
      description: incomeData.description || incomeData.category
    };
    
    console.log("Sending API data:", apiData);
    
    const response = await apiClient.post('/transactions/income', apiData);
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding income:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Add new expense
export const addExpense = async (expenseData) => {
  try {
    // Get or create category ID based on the category name
    const categoryId = await getCategoryIdByName(expenseData.category);
    
    // Ensure we have a valid wallet ID
    let walletId = expenseData.walletId || localStorage.getItem('defaultWalletId');
    
    // If still no wallet ID, use a default mock ID
    if (!walletId) {
      walletId = '00000000-0000-0000-0000-000000000000';
      localStorage.setItem('defaultWalletId', walletId);
    }
    
    // We need to convert the data from the frontend format to the API format
    const apiData = {
      walletId: walletId,
      categoryId: categoryId,
      amount: parseFloat(expenseData.amount),
      description: expenseData.description || expenseData.category
    };
    
    const response = await apiClient.post('/transactions/expenses', apiData);
    return response.data;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

// Update income
export const updateIncome = async (id, incomeData) => {
  try {
    // Get or create category ID based on the category name
    const categoryId = await getCategoryIdByName(incomeData.category);
    
    const apiData = {
      amount: parseFloat(incomeData.amount),
      categoryId: categoryId,
      description: incomeData.description || incomeData.category
    };
    
    const response = await apiClient.put(`/transactions/income/${id}`, apiData);
    return response.data;
  } catch (error) {
    console.error('Error updating income:', error);
    throw error;
  }
};

// Update expense
export const updateExpense = async (id, expenseData) => {
  try {
    // Get or create category ID based on the category name
    const categoryId = await getCategoryIdByName(expenseData.category);
    
    const apiData = {
      amount: parseFloat(expenseData.amount),
      categoryId: categoryId,
      description: expenseData.description || expenseData.category
    };
    
    const response = await apiClient.put(`/transactions/expenses/${id}`, apiData);
    return response.data;
  } catch (error) {
    console.error('Error updating expense:', error);
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
    throw error;
  }
}; 