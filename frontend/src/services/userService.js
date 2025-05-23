import apiClient from '../apiClient';

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Update current user profile
export const updateCurrentUser = async (userData) => {
  try {
    const response = await apiClient.put('/users/me', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete current user account
export const deleteCurrentUser = async () => {
  try {
    const response = await apiClient.delete('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}; 