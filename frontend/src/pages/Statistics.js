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
  Alert,
  Chip
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
import Header from '../components/Header';
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
          // Clone the date before modifying to avoid changing the original
          const todayCopy = new Date(today);
          const day = todayCopy.getDay();
          const diff = todayCopy.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
          fromDate = new Date(todayCopy.setDate(diff));
        }
        
        // Format dates for API - ensure we're using the correct ISO string format
        const from = fromDate.toISOString().split('T')[0];
        // Use a fresh instance of today since the previous one might have been modified
        const to = new Date().toISOString().split('T')[0];
        
        console.log(`Fetching statistics from: ${from} to: ${to}`);
        
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

  // Check if we have any data
  const hasData = () => {
    return (
      statsData.incomeVsExpense.labels.length > 0 ||
      (statsData.categoryBreakdown.expenses && statsData.categoryBreakdown.expenses.length > 0) ||
      (statsData.categoryBreakdown.income && statsData.categoryBreakdown.income.length > 0)
    );
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
        <Header title="Financial Statistics" />
        
        {/* Time Range Filter */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range-select"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {!loading && !error && !hasData() && (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              No transaction data available for the selected period. Add some transactions to see your statistics!
            </Alert>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              Try selecting a different time range or add new transactions to view statistics.
            </Typography>
          </Box>
        )}
        
        {!loading && !error && hasData() && (
          <>
            {/* Financial Summary */}
            <Grid container spacing={3} className="stats-container">
              {/* Income vs Expense Over Time */}
              <Grid item xs={12} md={8}>
                <Paper elevation={2} className="chart-container">
                  <Typography variant="h6" className="chart-title">
                    <InsightsIcon /> Income vs Expense Over Time
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line options={incomeVsExpenseOptions} data={incomeVsExpenseData} />
                  </Box>
                </Paper>
              </Grid>
              
              {/* Expense Categories */}
              <Grid item xs={12} md={4}>
                <Paper elevation={2} className="chart-container">
                  <Typography variant="h6" className="chart-title">
                    <TrendingDownIcon /> Expense Breakdown
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {statsData.categoryBreakdown.expenses && statsData.categoryBreakdown.expenses.length > 0 ? (
                      <Pie data={expenseCategoryData} />
                    ) : (
                      <Typography color="text.secondary">No expense data available</Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
              
              {/* Monthly Comparison */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} className="chart-container">
                  <Typography variant="h6" className="chart-title">
                    <TrendingUpIcon /> Income vs Expenses
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }} 
                      data={monthlyComparisonData} 
                    />
                  </Box>
                </Paper>
              </Grid>
              
              {/* Savings Rate */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} className="chart-container">
                  <Typography variant="h6" className="chart-title">
                    <TrendingUpIcon /> Savings Breakdown
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {statsData.summary.totalIncome > 0 ? (
                      <Pie data={savingsData} />
                    ) : (
                      <Typography color="text.secondary">No savings data available</Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
              
              {/* Summary Stats */}
              <Grid item xs={12}>
                <Paper elevation={2} className="summary-container">
                  <Typography variant="h6" className="chart-title">
                    Financial Summary
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">Total Income</Typography>
                      <Typography variant="h6" color="success.main">
                        ${statsData.summary.totalIncome.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">Total Expenses</Typography>
                      <Typography variant="h6" color="error.main">
                        ${statsData.summary.totalExpenses.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">Net Savings</Typography>
                      <Typography variant="h6" color={statsData.summary.netSavings >= 0 ? "success.main" : "error.main"}>
                        ${statsData.summary.netSavings.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">Savings Rate</Typography>
                      <Typography variant="h6" color={statsData.summary.savingsRate >= 0 ? "success.main" : "error.main"}>
                        {statsData.summary.savingsRate.toFixed(1)}%
                      </Typography>
                    </Grid>
                    
                    {/* Top Categories */}
                    <Grid item xs={6} md={6} sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Top Expense Category</Typography>
                      {statsData.summary.topExpenseCategory ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Chip 
                            label={statsData.summary.topExpenseCategory.category} 
                            color="error" 
                            size="small" 
                            sx={{ mr: 1 }} 
                          />
                          <Typography variant="body2">
                            ${statsData.summary.topExpenseCategory.amount.toFixed(2)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No expense data</Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={6} md={6} sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Top Income Category</Typography>
                      {statsData.summary.topIncomeCategory ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Chip 
                            label={statsData.summary.topIncomeCategory.category} 
                            color="success" 
                            size="small" 
                            sx={{ mr: 1 }} 
                          />
                          <Typography variant="body2">
                            ${statsData.summary.topIncomeCategory.amount.toFixed(2)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No income data</Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Statistics; 