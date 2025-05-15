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
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
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

const CategoryDialog = ({ open, onClose, onSave, category = null, title, categories }) => {
  const [categoryData, setCategoryData] = useState({
    name: '',
    type: 'expense',
    icon: 'general',
    color: '#1976d2',
    description: ''
  });
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (category) {
      setCategoryData({
        name: category.name || '',
        type: category.type || 'expense',
        icon: category.icon || 'general',
        color: category.color || '#1976d2',
        description: category.description || ''
      });
    } else {
      setCategoryData({
        name: '',
        type: 'expense',
        icon: 'general',
        color: '#1976d2',
        description: ''
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

  const handleSubmit = () => {
    if (nameError) return;
    onSave(categoryData);
    onClose();
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
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="type-label">Category Type</InputLabel>
          <Select
            labelId="type-label"
            name="type"
            value={categoryData.type}
            onChange={handleChange}
            label="Category Type"
          >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="icon-label">Icon</InputLabel>
          <Select
            labelId="icon-label"
            name="icon"
            value={categoryData.icon}
            onChange={handleChange}
            label="Icon"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {categoryIcons[selected]}
                <Box sx={{ ml: 1 }}>{selected.charAt(0).toUpperCase() + selected.slice(1)}</Box>
              </Box>
            )}
          >
            {Object.entries(categoryIcons).map(([key, icon]) => (
              <MenuItem key={key} value={key}>
                <ListItemIcon>
                  {icon}
                </ListItemIcon>
                <ListItemText primary={key.charAt(0).toUpperCase() + key.slice(1)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="color-label">Color</InputLabel>
          <Select
            labelId="color-label"
            name="color"
            value={categoryData.color}
            onChange={handleChange}
            label="Color"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    bgcolor: selected,
                    mr: 1
                  }} 
                />
                {selected}
              </Box>
            )}
          >
            {categoryColors.map(color => (
              <MenuItem key={color} value={color}>
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    bgcolor: color,
                    mr: 1
                  }} 
                />
                {color}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Description (optional)"
          name="description"
          value={categoryData.description}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!categoryData.name || !!nameError}
        >
          Save
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

  // Dummy data for demonstration
  useEffect(() => {
    const fetchCategories = async () => {
      // Here you would fetch categories from your API
      // For now, let's use dummy data
      setLoading(true);
      
      try {
        const dummyCategories = [
          {
            id: 1,
            name: 'Groceries',
            type: 'expense',
            icon: 'shopping',
            color: '#2e7d32',
            description: 'Food and household items',
            isDefault: true
          },
          {
            id: 2,
            name: 'Rent',
            type: 'expense',
            icon: 'housing',
            color: '#c62828',
            description: 'Monthly housing rent',
            isDefault: true
          },
          {
            id: 3,
            name: 'Transportation',
            type: 'expense',
            icon: 'transportation',
            color: '#f57c00',
            description: 'Public transport and ride sharing',
            isDefault: true
          },
          {
            id: 4,
            name: 'Dining Out',
            type: 'expense',
            icon: 'food',
            color: '#6a1b9a',
            description: 'Restaurants and cafes',
            isDefault: false
          },
          {
            id: 5,
            name: 'Salary',
            type: 'income',
            icon: 'income',
            color: '#1976d2',
            description: 'Monthly income from job',
            isDefault: true
          },
          {
            id: 6,
            name: 'Freelance',
            type: 'income',
            icon: 'income',
            color: '#00838f',
            description: 'Income from freelance work',
            isDefault: false
          }
        ];
        
        setCategories(dummyCategories);
        applyFilter(dummyCategories, filter);
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

  const handleDeleteCategory = (categoryId) => {
    // Check if it's a default category
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    
    if (categoryToDelete.isDefault) {
      setAlert({
        open: true,
        message: 'Default categories cannot be deleted',
        severity: 'error'
      });
      handleCloseMenu();
      return;
    }
    
    // Here you would delete the category via API
    setCategories(categories.filter(category => category.id !== categoryId));
    applyFilter(categories.filter(category => category.id !== categoryId), filter);
    
    setAlert({
      open: true,
      message: 'Category deleted successfully',
      severity: 'success'
    });
    
    handleCloseMenu();
  };

  const handleSaveCategory = (categoryData) => {
    if (currentCategory) {
      // Update existing category
      const updatedCategories = categories.map(category => 
        category.id === currentCategory.id 
          ? { ...category, ...categoryData } 
          : category
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
      const newCategory = {
        id: Date.now(), // Using timestamp as temporary ID
        ...categoryData,
        isDefault: false
      };
      
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      applyFilter(updatedCategories, filter);
      
      setAlert({
        open: true,
        message: 'Category created successfully',
        severity: 'success'
      });
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
        <Box className="categories-header">
          <Typography variant="h4" component="h1">
            Categories
          </Typography>
          
          <Box>
            <FormControl variant="outlined" sx={{ minWidth: 150, mr: 2 }}>
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
                          {category.isDefault && (
                            <Tooltip title="Default category" placement="top">
                              <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1 }} />
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                          {category.description && ` • ${category.description}`}
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