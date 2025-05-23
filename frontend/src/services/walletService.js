import apiClient from '../apiClient';



// Get all wallets
export const getAllWallets = async () => {
  try {
    const response = await apiClient.get('/wallets');
    return response.data;
  } catch (error) {
    console.error('Error fetching wallets:', error);
    throw error;
  }
};

export const fetchUserProfile = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

// Get a wallet by ID
export const getWalletById = async (id) => {
  try {
    const response = await apiClient.get(`/wallets/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching wallet with ID ${id}:`, error);
    throw error;
  }
};

// Create a new wallet
export const createWallet = async (walletData) => {
  try {
    const response = await apiClient.post('/wallets', walletData);
    return response.data;
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw error;
  }
};

// Update a wallet
export const updateWallet = async (id, data) => {
  const response = await apiClient.put(`/wallets/${id}`, data);
  return response.data;
};

// Delete a wallet
export const deleteWallet = async (id) => {
  try {
    const response = await apiClient.delete(`/wallets/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting wallet with ID ${id}:`, error);
    throw error;
  }
};
// services/walletService.js

export const getWalletBalance = async (walletId) => {
  try {
    const response = await apiClient.get(`/wallets/${walletId}/balance`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching balance for wallet ID ${walletId}:`, error);
    throw error;
  }
};

export const setMainWallet = async (walletId) => {
  const response = await apiClient.put(`/wallets/${walletId}/set-main`);
  return walletId; // bo serwer już go ustawił
};



// Set manual balance for a wallet
export const setManualBalance = async (id, balance) => {
  try {
    const response = await apiClient.put(`/wallets/${id}/set-balance`, { balance });
    return response.data;
  } catch (error) {
    console.error(`Error setting manual balance for wallet ${id}:`, error);
    throw error;
  }
};

// Ensure user has a default wallet, create one if needed
export const ensureDefaultWallet = async () => {
  try {
    console.log("Starting ensureDefaultWallet function");
    
    // Check if we already have a wallet ID in localStorage
    const storedWalletId = localStorage.getItem('defaultWalletId');
    console.log("Stored wallet ID from localStorage:", storedWalletId);
    
    if (storedWalletId) {
      console.log("Attempting to verify stored wallet", storedWalletId);
      // Try to verify that this wallet still exists and is accessible
      try {
        const wallet = await apiClient.get(`/wallets/${storedWalletId}`);
        console.log("Successfully verified wallet:", wallet.data);
        return storedWalletId; // Wallet exists and is accessible
      } catch (walletError) {
        console.error("Error verifying stored wallet:", walletError);
        // If the wallet doesn't exist or isn't accessible, continue to create a new one
        localStorage.removeItem('defaultWalletId');
      }
    }
    
    console.log("No valid stored wallet found, fetching all wallets");
    // Get the user's wallets
    const response = await apiClient.get('/wallets');
    console.log("Fetched wallets response:", response.data);
    
    // If the user has any wallets, use the first one
    if (response.data && response.data.length > 0) {
      const defaultWallet = response.data[0];
      console.log("Using existing wallet as default:", defaultWallet);
      localStorage.setItem('defaultWalletId', defaultWallet.id);
      return defaultWallet.id;
    }
    
    console.log("No existing wallets found, creating a new default wallet");
    // If user has no wallets, create a default one
    const newWallet = await createDefaultWallet();
    console.log("Created new default wallet:", newWallet);
    localStorage.setItem('defaultWalletId', newWallet.id);
    return newWallet.id;
  } catch (error) {
    console.error('Error in ensureDefaultWallet:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // If all else fails, use a mock wallet ID
    const mockWalletId = '00000000-0000-0000-0000-000000000000';
    console.log("Using mock wallet ID as fallback:", mockWalletId);
    localStorage.setItem('defaultWalletId', mockWalletId);
    return mockWalletId;
  }
};

// Function to create a default wallet for the user
export const createDefaultWallet = async () => {
  console.log("Creating default wallet");
  const defaultWallet = {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Default Wallet',
    type: 'Personal',
    currency: 'USD',
    initialBalance: 0
  };
  
  try {
    const response = await apiClient.post('/wallets', defaultWallet);
    console.log("Default wallet created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating default wallet:", error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}; 
// Dodaj członka do portfela
export const addMemberToWallet = async (walletId, email) => {
  try {
    const response = await apiClient.post(`/wallets/${walletId}/members/email`, { email });
    return response.data;
  } catch (error) {
    console.error(`Error adding member to wallet ID ${walletId}:`, error);
    throw error;
  }
};