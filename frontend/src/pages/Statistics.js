import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  BarElement
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InsightsIcon from '@mui/icons-material/Insights';
import Sidebar from '../components/Sidebar';
import apiClient from '../apiClient';

import '../styles/Statistics.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Statistics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({
    incomeVsExpense: {
      labels: [],
      incomeData: [],
      expenseData: []
    },
    categoryBreakdown: {
      expenses: [],
      income: []
    },
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      savingsRate: 0,
      topExpenseCategory: null,
      topIncomeCategory: null
    }
  });

  // Fetch statistics data based on time range
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Calculate date range based on selected time range
        const today = new Date();
        let fromDate;
        
        if (timeRange === 'month') {
          fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (timeRange === 'year') {
          fromDate = new Date(today.getFullYear(), 0, 1);
        } else if (timeRange === 'week') {
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
          fromDate = new Date(today.setDate(diff));
        }
        
        // Format dates for API
        const from = fromDate.toISOString().split('T')[0];
        const to = today.toISOString().split('T')[0];
        
        // Make parallel API requests
        const [incomeExpenseRes, categoryBreakdownRes, summaryRes] = await Promise.all([
          apiClient.get(`/transactions/statistics/income-expense?from=${from}&to=${to}`),
          apiClient.get(`/transactions/statistics/category-breakdown?from=${from}&to=${to}`),
          apiClient.get(`/transactions/statistics/summary?from=${from}&to=${to}`)
        ]);
        
        // Process income vs expense data
        const incomeExpenseData = incomeExpenseRes.data;
        const labels = incomeExpenseData.map(item => item.label);
        const incomeData = incomeExpenseData.map(item => item.income);
        const expenseData = incomeExpenseData.map(item => item.expense);
        
        // Set the state with fetched data
        setStatsData({
          incomeVsExpense: {
            labels,
            incomeData,
            expenseData
          },
          categoryBreakdown: categoryBreakdownRes.data,
          summary: summaryRes.data
        });
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, [timeRange]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  // Chart configurations
  const incomeVsExpenseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  };

  const incomeVsExpenseData = {
    labels: statsData.incomeVsExpense.labels,
    datasets: [
      {
        label: 'Income',
        data: statsData.incomeVsExpense.incomeData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3
      },
      {
        label: 'Expenses',
        data: statsData.incomeVsExpense.expenseData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3
      },
    ],
  };

  const expenseCategoryData = {
    labels: statsData.categoryBreakdown.expenses?.map(c => c.category) || [],
    datasets: [
      {
        data: statsData.categoryBreakdown.expenses?.map(c => c.amount) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const savingsData = {
    labels: ['Savings', 'Expenses'],
    datasets: [
      {
        data: [
          statsData.summary.netSavings > 0 ? statsData.summary.netSavings : 0, 
          statsData.summary.totalExpenses
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyComparisonData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: timeRange === 'year' ? 'Yearly Total' : 'Monthly Total',
        data: [statsData.summary.totalIncome, statsData.summary.totalExpenses],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
      },
    ],
  };

  const monthlyComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  };

  if (loading) {
    return (
      <Box className="page-container">
        <Sidebar />
        <Box className="page-content" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="page-container">
        <Sidebar />
        <Box className="page-content">
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="page-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box className="page-content">
        {/* Header */}
        <Box className="statistics-header">
          <Typography variant="h4" component="h1" className="statistics-title">
            Financial Statistics
          </Typography>
          <Box className="statistics-filter">
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range-select"
                value={timeRange}
                label="Time Range"
                onChange={handleTimeRangeChange}
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Box className="summary-section">
          <Paper className="summary-card">
            <Typography className="summary-label">
              Total Income
            </Typography>
            <Typography className="summary-value">
              {statsData.summary.totalIncome.toFixed(2)} $
            </Typography>
          </Paper>
          
          <Paper className="summary-card">
            <Typography className="summary-label">
              Total Expenses
            </Typography>
            <Typography className="summary-value">
              {statsData.summary.totalExpenses.toFixed(2)} $
            </Typography>
          </Paper>
          
          <Paper className="summary-card">
            <Typography className="summary-label">
              Net Savings
            </Typography>
            <Typography className="summary-value">
              {statsData.summary.netSavings.toFixed(2)} $
            </Typography>
          </Paper>
          
          <Paper className="summary-card">
            <Typography className="summary-label">
              Savings Rate
            </Typography>
            <Typography className="summary-value">
              {statsData.summary.savingsRate.toFixed(1)}%
            </Typography>
          </Paper>
        </Box>

        {/* Charts */}
        <Box className="chart-containers">
          <Paper className="chart-card">
            <Typography className="chart-title">
              Income vs Expenses
            </Typography>
            <Box className="chart-container">
              <Line 
                options={incomeVsExpenseOptions} 
                data={incomeVsExpenseData} 
              />
            </Box>
          </Paper>
          
          <Paper className="chart-card">
            <Typography className="chart-title">
              Expense Breakdown by Category
            </Typography>
            <Box className="chart-container">
              <Pie data={expenseCategoryData} />
            </Box>
          </Paper>
          
          <Paper className="chart-card">
            <Typography className="chart-title">
              Savings vs Expenses
            </Typography>
            <Box className="chart-container">
              <Pie data={savingsData} />
            </Box>
          </Paper>
          
          <Paper className="chart-card">
            <Typography className="chart-title">
              Income vs Expenses Comparison
            </Typography>
            <Box className="chart-container">
              <Bar 
                options={monthlyComparisonOptions} 
                data={monthlyComparisonData} 
              />
            </Box>
          </Paper>
        </Box>

      </Box>
    </Box>
  );
};

export default Statistics; 