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
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!accessToken || !refreshToken) {
    throw new Error('No authentication tokens found');
  }

  try {
    const requestData = {
      name: walletData.name,
      type: walletData.type || 0,
      currency: walletData.currency || 'zł',
      initialBalance: walletData.initialBalance || 0,
      id: walletData.id || null
    };

    const response = await apiClient.post('/wallets', requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating wallet:', error);
    
    if (error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      for (const [field, messages] of Object.entries(validationErrors)) {
        console.error(`Field '${field}':`, messages);
      }
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
    // W odpowiedzi backendu powinny znajdować się składowe income/expenses:
    return {
      currentBalance: response.data.currentBalance,
      totalIncome: response.data.totalIncome || 0,
      totalExpenses: response.data.totalExpenses || 0,
    };
  } catch (error) {
    console.error(`Error fetching balance for wallet ID ${walletId}:`, error);
    throw error;
  }
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
    // Check if we already have a wallet ID in localStorage
    const storedWalletId = localStorage.getItem('defaultWalletId');
    
    if (storedWalletId) {
      // Try to verify that this wallet still exists and is accessible
      try {
        const wallet = await apiClient.get(`/wallets/${storedWalletId}`);
        return storedWalletId; // Wallet exists and is accessible
      } catch (walletError) {
        // If the wallet doesn't exist or isn't accessible, continue to create a new one
        localStorage.removeItem('defaultWalletId');
      }
    }
    
    // Get the user's wallets
    const response = await apiClient.get('/wallets');
    
    // If the user has any wallets, use the first one
    if (response.data && response.data.length > 0) {
      const defaultWallet = response.data[0];
      localStorage.setItem('defaultWalletId', defaultWallet.id);
      return defaultWallet.id;
    }
    
    // If user has no wallets, create a default one
    const newWallet = await createDefaultWallet();
    localStorage.setItem('defaultWalletId', newWallet.id);
    return newWallet.id;
  } catch (error) {
    console.error('Error in ensureDefaultWallet:', error);
    
    // If all else fails, use a mock wallet ID
    const mockWalletId = '00000000-0000-0000-0000-000000000000';
    localStorage.setItem('defaultWalletId', mockWalletId);
    return mockWalletId;
  }
};

// Function to create a default wallet for the user
export const createDefaultWallet = async () => {
  console.warn("Default wallet creation is disabled.");
  return null;
};

// Dodaj członka do portfela
// Dodaj członka do portfela
export const addMemberToWallet = async (walletId, email) => {
  try {
    const response = await apiClient.post(`users/add-friend-to-wallet`, {
      WalletId: walletId,
      FriendEmail: email,
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding member to wallet ID ${walletId}:`, error);

    if (error.response) {
      if (
          error.response?.status === 400 &&
          error.response?.data === "Nie znaleziono użytkownika o podanym adresie e-mail."
      ) {
        return { error: 'user_not_found', message: 'Użytkownik o podanym adresie e-mail nie istnieje.' };
      }
    }

    throw new Error(
        error.response?.data || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.'
    );
  }
};