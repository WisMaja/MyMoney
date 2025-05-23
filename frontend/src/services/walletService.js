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
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    console.log('Access token:', accessToken);
    console.log('Refresh token:', refreshToken);
    
    // Mapowanie typów na wartości enum
    const typeMap = {
      'Personal': 0,
      'Credit': 1,
      'Savings': 2
    };
    
    // Konwertuj typ na liczbę
    const mappedType = typeMap[walletData.type] !== undefined ? typeMap[walletData.type] : 0;
    
    // Przygotuj dane z poprawnym typem
    const requestData = {
      name: walletData.name,
      type: mappedType,
      currency: walletData.currency,
      initialBalance: walletData.initialBalance
    };
    
    console.log('Request URL:', `${apiClient.defaults.baseURL}/wallets`);
    console.log('Request headers:', apiClient.defaults.headers);
    console.log('Request data (stringified):', JSON.stringify(requestData));
    
    const response = await apiClient.post('/wallets', requestData);
    
    console.log('Wallet created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.log('Error creating wallet:', error);
    console.log('Error response:', error.response?.data);
    console.log('Error status:', error.response?.status);
    console.log('Error config:', error.config);
    
    if (error.response?.data?.errors) {
      console.log('Validation errors:', error.response.data.errors);
      Object.entries(error.response.data.errors).forEach(([field, messages]) => {
        console.log(`Field '${field}':`, messages);
      });
    }
    
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

// Set a wallet as the main wallet
export const setMainWallet = async (id) => {
  try {
    const response = await apiClient.put(`/wallets/${id}/set-main`);
    localStorage.setItem('defaultWalletId', id); // Also update localStorage for consistency
    return response.data;
  } catch (error) {
    console.error(`Error setting wallet ${id} as main wallet:`, error);
    throw error;
  }
};

// Get current user's main wallet
export const getMainWallet = async () => {
  try {
    const response = await apiClient.get('/users/me');
    const mainWalletId = response.data.mainWalletId;
    
    if (mainWalletId) {
      // Save to localStorage for reference
      localStorage.setItem('defaultWalletId', mainWalletId);
      return await getWalletById(mainWalletId);
    } else {
      // If no main wallet is set, ensure a default one and set it as main
      const defaultWalletId = await ensureDefaultWallet();
      await setMainWallet(defaultWalletId);
      return await getWalletById(defaultWalletId);
    }
  } catch (error) {
    console.error('Error fetching main wallet:', error);
    throw error;
  }
};

// Get all user wallets for wallet selection
export const getUserWallets = async () => {
  try {
    const response = await getAllWallets();
    return response;
  } catch (error) {
    console.error('Error fetching user wallets:', error);
    throw error;
  }
};

// Get main wallet ID without full wallet data
export const getMainWalletId = async () => {
  try {
    const response = await apiClient.get('/users/me');
    const mainWalletId = response.data.mainWalletId;
    
    if (mainWalletId) {
      localStorage.setItem('defaultWalletId', mainWalletId);
      return mainWalletId;
    } else {
      // If no main wallet is set, ensure a default one and set it as main
      const defaultWalletId = await ensureDefaultWallet();
      await setMainWallet(defaultWalletId);
      localStorage.setItem('defaultWalletId', defaultWalletId);
      return defaultWalletId;
    }
  } catch (error) {
    console.error('Error fetching main wallet ID:', error);
    // Fallback to localStorage
    const storedWalletId = localStorage.getItem('defaultWalletId');
    if (storedWalletId) {
      return storedWalletId;
    }
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