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

// Update profile image
export const updateProfileImage = async (file) => {
  try {
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    console.log('File size:', file.size, 'bytes');
    console.log('Sending file as multipart/form-data...');

    // Create FormData to send file as multipart/form-data
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await apiClient.put('/users/me/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile image:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
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