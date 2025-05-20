import apiClient from '../apiClient';

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get a category by ID
export const getCategoryById = async (id) => {
  try {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
};

// Map frontend category names to backend category IDs
// This is a temporary solution until we implement proper category selection
export const getCategoryIdByName = async (categoryName) => {
  try {
    // First try to find the category by name
    const categories = await getAllCategories();
    const category = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    // If we found it, return the ID
    if (category) {
      return category.id;
    }
    
    // If not found, create a new category with this name
    const newCategory = await createCategory({
      name: categoryName
    });
    
    return newCategory.id;
  } catch (error) {
    console.error(`Error getting/creating category for ${categoryName}:`, error);
    throw error;
  }
}; 