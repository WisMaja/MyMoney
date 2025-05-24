import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Category as CategoryIcon,
  ArrowDropDown as ArrowDropDownIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalDining as DiningIcon,
  DirectionsCar as TransportIcon,
  Home as HomeIcon,
  MedicalServices as HealthcareIcon,
  School as EducationIcon,
  Devices as TechnologyIcon,
  LocalAtm as IncomeIcon,
  AttachMoney as GeneralIcon,
  ColorLens as ColorIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import '../styles/Categories.css';

// Map of category icons
const categoryIcons = {
  income: <IncomeIcon />,
  shopping: <ShoppingCartIcon />,
  food: <DiningIcon />,
  transportation: <TransportIcon />,
  housing: <HomeIcon />,
  healthcare: <HealthcareIcon />,
  education: <EducationIcon />,
  technology: <TechnologyIcon />,
  general: <GeneralIcon />
};

// Category colors
const categoryColors = [
  '#1976d2', // Blue
  '#2e7d32', // Green
  '#c62828', // Red
  '#f57c00', // Orange
  '#6a1b9a', // Purple
  '#00838f', // Teal
  '#558b2f', // Light Green
  '#d81b60', // Pink
  '#5d4037', // Brown
  '#546e7a', // Blue Grey
];

// Helper function to get default UI properties for a category
const getDefaultCategoryProps = (categoryName, isGlobal) => {
  const name = categoryName.toLowerCase();
  
  // Determine type based on common category names
  let type = 'expense';
  if (name.includes('salary') || name.includes('income') || name.includes('wage') || 
      name.includes('freelance') || name.includes('bonus') || name.includes('dividend')) {
    type = 'income';
  }
  
  // Determine icon based on category name
  let icon = 'general';
  if (name.includes('food') || name.includes('restaurant') || name.includes('dining')) icon = 'food';
  else if (name.includes('transport') || name.includes('car') || name.includes('bus') || name.includes('taxi')) icon = 'transportation';
  else if (name.includes('shop') || name.includes('grocery') || name.includes('store')) icon = 'shopping';
  else if (name.includes('rent') || name.includes('house') || name.includes('home')) icon = 'housing';
  else if (name.includes('health') || name.includes('medical') || name.includes('doctor')) icon = 'healthcare';
  else if (name.includes('education') || name.includes('school') || name.includes('course')) icon = 'education';
  else if (name.includes('tech') || name.includes('computer') || name.includes('software')) icon = 'technology';
  else if (type === 'income') icon = 'income';
  
  // Assign color based on hash of name for consistency
  const colorIndex = Math.abs(categoryName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % categoryColors.length;
  const color = categoryColors[colorIndex];
  
  return { type, icon, color };
};

const CategoryDialog = ({ open, onClose, onSave, category = null, title, categories }) => {
  const [categoryData, setCategoryData] = useState({
    name: ''
  });
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setCategoryData({
        name: category.name || ''
      });
    } else {
      setCategoryData({
        name: ''
      });
    }
    setNameError('');
  }, [category, open]);

  const handleChange = (e) => {
    setCategoryData({
      ...categoryData,
      [e.target.name]: e.target.value
    });
    
    if (e.target.name === 'name') {
      const duplicate = categories.find(
        cat => cat.name.toLowerCase() === e.target.value.toLowerCase() && 
        (!category || cat.id !== category.id)
      );
      
      setNameError(duplicate ? 'Category name already exists' : '');
    }
  };

  const handleSubmit = async () => {
    if (nameError || !categoryData.name.trim()) return;
    
    setLoading(true);
    try {
      await onSave(categoryData);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Category Name"
          name="name"
          value={categoryData.name}
          onChange={handleChange}
          margin="normal"
          required
          error={!!nameError}
          helperText={nameError}
          disabled={loading}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Note: Category type, icon, and color will be automatically assigned based on the name.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!!nameError || !categoryData.name.trim() || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [dialogTitle, setDialogTitle] = useState('Create Category');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      
      try {
        const apiCategories = await getAllCategories();
        
        // Transform API categories to include UI properties
        const transformedCategories = apiCategories.map(cat => {
          const uiProps = getDefaultCategoryProps(cat.name, cat.isGlobal);
          return {
            id: cat.id,
            name: cat.name,
            isGlobal: cat.isGlobal,
            ...uiProps
          };
        });
        
        setCategories(transformedCategories);
        applyFilter(transformedCategories, filter);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setAlert({
          open: true,
          message: 'Failed to load categories',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const applyFilter = (cats, filterValue) => {
    if (filterValue === 'all') {
      setFilteredCategories(cats);
    } else {
      setFilteredCategories(cats.filter(cat => cat.type === filterValue));
    }
  };

  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setFilter(newFilter);
    applyFilter(categories, newFilter);
  };

  const handleCreateCategory = () => {
    setCurrentCategory(null);
    setDialogTitle('Create Category');
    setOpenDialog(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setDialogTitle('Edit Category');
    setOpenDialog(true);
    handleCloseMenu();
  };

  const handleDeleteCategory = async (categoryId) => {
    // Check if it's a global category
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    
    if (categoryToDelete.isGlobal) {
      setAlert({
        open: true,
        message: 'Global categories cannot be deleted',
        severity: 'error'
      });
      handleCloseMenu();
      return;
    }
    
    try {
      await deleteCategory(categoryId);
      
      const updatedCategories = categories.filter(category => category.id !== categoryId);
      setCategories(updatedCategories);
      applyFilter(updatedCategories, filter);
      
      setAlert({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      setAlert({
        open: true,
        message: 'Failed to delete category',
        severity: 'error'
      });
    }
    
    handleCloseMenu();
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (currentCategory) {
        // Update existing category
        const updatedCategory = await updateCategory(currentCategory.id, categoryData);
        
        const uiProps = getDefaultCategoryProps(updatedCategory.name, updatedCategory.isGlobal);
        const categoryWithProps = {
          ...updatedCategory,
          ...uiProps
        };
        
        const updatedCategories = categories.map(category => 
          category.id === currentCategory.id ? categoryWithProps : category
        );
        setCategories(updatedCategories);
        applyFilter(updatedCategories, filter);
        
        setAlert({
          open: true,
          message: 'Category updated successfully',
          severity: 'success'
        });
      } else {
        // Create new category
        const newCategory = await createCategory(categoryData);
        
        const uiProps = getDefaultCategoryProps(newCategory.name, newCategory.isGlobal);
        const categoryWithProps = {
          ...newCategory,
          ...uiProps
        };
        
        const updatedCategories = [...categories, categoryWithProps];
        setCategories(updatedCategories);
        applyFilter(updatedCategories, filter);
        
        setAlert({
          open: true,
          message: 'Category created successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setAlert({
        open: true,
        message: `Failed to ${currentCategory ? 'update' : 'create'} category`,
        severity: 'error'
      });
      throw error; // Re-throw to handle in dialog
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleOpenMenu = (event, categoryId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCategoryId(categoryId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedCategoryId(null);
  };

  return (
    <Box className="page-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box className="page-content">
        {/* Header */}
        <Header title="Categories" />
        
        {/* Filter and Create Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControl variant="outlined" sx={{ minWidth: 150 }}>
            <InputLabel id="filter-label">Filter</InputLabel>
            <Select
              labelId="filter-label"
              value={filter}
              onChange={handleFilterChange}
              label="Filter"
              size="small"
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateCategory}
          >
            Create Category
          </Button>
        </Box>

        {/* Categories List */}
        <Box className="categories-list-container">
          {loading ? (
            <Box className="loading-container">
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading categories...
              </Typography>
            </Box>
          ) : filteredCategories.length === 0 ? (
            <Box className="no-categories">
              <CategoryIcon sx={{ fontSize: 60, color: '#aaa', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No categories found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {filter === 'all' 
                  ? 'Create your first category to organize your transactions.' 
                  : `No ${filter} categories found. Create your first ${filter} category.`}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateCategory}
                sx={{ mt: 3 }}
              >
                Create Category
              </Button>
            </Box>
          ) : (
            <List>
              {filteredCategories.map((category, index) => (
                <React.Fragment key={category.id}>
                  {index > 0 && <Divider />}
                  <ListItem className="category-list-item">
                    <ListItemIcon>
                      <Box 
                        className="category-icon" 
                        style={{ backgroundColor: category.color }}
                      >
                        {categoryIcons[category.icon]}
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {category.name}
                          {category.isGlobal && (
                            <Tooltip title="Global category" placement="top">
                              <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1 }} />
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="more options"
                        onClick={(e) => handleOpenMenu(e, category.id)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Options Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleEditCategory(categories.find(c => c.id === selectedCategoryId))}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
          <MenuItem onClick={() => handleDeleteCategory(selectedCategoryId)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>

        {/* Dialogs */}
        <CategoryDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSave={handleSaveCategory}
          category={currentCategory}
          title={dialogTitle}
          categories={categories}
        />

        {/* Snackbar for alerts */}
        <Snackbar 
          open={alert.open} 
          autoHideDuration={6000} 
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Categories; 