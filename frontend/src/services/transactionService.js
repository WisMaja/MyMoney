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
    
    // Parse date from the form if available
    let createdAt = null;
    if (incomeData.date) {
      createdAt = new Date(incomeData.date);
      console.log("Using custom date for income:", createdAt);
    }
    
    // We need to convert the data from the frontend format to the API format
    const apiData = {
      walletId: walletId,
      categoryId: categoryId,
      amount: parseFloat(incomeData.amount),
      description: incomeData.description || incomeData.category,
      createdAt: createdAt
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
    console.log("Starting addExpense with data:", expenseData);
    
    // Get or create category ID based on the category name
    const categoryId = await getCategoryIdByName(expenseData.category);
    
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
      console.log("Using custom date for expense:", createdAt);
    }
    
    // We need to convert the data from the frontend format to the API format
    const apiData = {
      walletId: walletId,
      categoryId: categoryId,
      amount: parseFloat(expenseData.amount),
      description: expenseData.description || expenseData.category,
      createdAt: createdAt
    };
    
    console.log("Sending API data:", apiData);
    
    const response = await apiClient.post('/transactions/expenses', apiData);
    console.log("API response:", response.data);
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
    console.log("Starting updateIncome with data:", incomeData);
    
    // Get or create category ID based on the category name
    const categoryId = await getCategoryIdByName(incomeData.category);
    
    // Parse date if available
    let createdAt = null;
    if (incomeData.date) {
      createdAt = new Date(incomeData.date);
      console.log("Using custom date for income update:", createdAt);
    }
    
    const apiData = {
      amount: parseFloat(incomeData.amount),
      categoryId: categoryId,
      description: incomeData.description || incomeData.category,
      createdAt: createdAt
    };
    
    console.log("Sending update data:", apiData);
    const response = await apiClient.put(`/transactions/income/${id}`, apiData);
    console.log("Update response:", response.data);
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
    console.log("Starting updateExpense with data:", expenseData);
    
    // Get or create category ID based on the category name
    const categoryId = await getCategoryIdByName(expenseData.category);
    
    // Parse date if available
    let createdAt = null;
    if (expenseData.date) {
      createdAt = new Date(expenseData.date);
      console.log("Using custom date for expense update:", createdAt);
    }
    
    const apiData = {
      amount: parseFloat(expenseData.amount),
      categoryId: categoryId,
      description: expenseData.description || expenseData.category,
      createdAt: createdAt
    };
    
    console.log("Sending update data:", apiData);
    const response = await apiClient.put(`/transactions/expenses/${id}`, apiData);
    console.log("Update response:", response.data);
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
    console.log("Deleting transaction:", id);
    const response = await apiClient.delete(`/transactions/${id}`);
    console.log("Delete response:", response.data);
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