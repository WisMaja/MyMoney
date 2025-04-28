import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Grid
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
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InsightsIcon from '@mui/icons-material/Insights';

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
  const [mockData, setMockData] = useState({
    incomeVsExpense: [],
    categoryBreakdown: {},
    monthlyTotals: [],
    savingsRate: 0,
    topExpenseCategory: '',
    highestIncome: 0
  });

  // Generate mock data based on time range
  useEffect(() => {
    generateMockData(timeRange);
  }, [timeRange]);

  const generateMockData = (range) => {
    // Generate months or days based on selected time range
    const labels = range === 'year' 
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    // Generate random data for income vs expense
    const incomeData = labels.map(() => Math.floor(Math.random() * 1000) + 500);
    const expenseData = labels.map(() => Math.floor(Math.random() * 800) + 200);
    
    // Generate category breakdown
    const categories = {
      'Food & Groceries': Math.floor(Math.random() * 300) + 100,
      'Housing & Utilities': Math.floor(Math.random() * 500) + 200,
      'Transportation': Math.floor(Math.random() * 200) + 50,
      'Entertainment': Math.floor(Math.random() * 150) + 50,
      'Healthcare': Math.floor(Math.random() * 100) + 30,
      'Education': Math.floor(Math.random() * 150) + 20
    };
    
    // Calculate monthly totals
    const incomeTotals = incomeData.reduce((acc, val) => acc + val, 0);
    const expenseTotals = expenseData.reduce((acc, val) => acc + val, 0);
    
    // Determine top expense category
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0];
    
    // Calculate savings rate
    const savingsRate = ((incomeTotals - expenseTotals) / incomeTotals) * 100;
    
    setMockData({
      incomeVsExpense: { labels, incomeData, expenseData },
      categoryBreakdown: categories,
      monthlyTotals: { income: incomeTotals, expense: expenseTotals },
      savingsRate: savingsRate.toFixed(1),
      topExpenseCategory: topCategory,
      highestIncome: Math.max(...incomeData)
    });
  };

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
          text: 'Amount (zł)'
        }
      }
    }
  };

  const incomeVsExpenseData = {
    labels: mockData.incomeVsExpense.labels,
    datasets: [
      {
        label: 'Income',
        data: mockData.incomeVsExpense.incomeData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3
      },
      {
        label: 'Expenses',
        data: mockData.incomeVsExpense.expenseData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3
      },
    ],
  };

  const categoryBreakdownData = {
    labels: Object.keys(mockData.categoryBreakdown),
    datasets: [
      {
        data: Object.values(mockData.categoryBreakdown),
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
          mockData.monthlyTotals.income - mockData.monthlyTotals.expense, 
          mockData.monthlyTotals.expense
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
        data: [mockData.monthlyTotals.income, mockData.monthlyTotals.expense],
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
          text: 'Amount (zł)'
        }
      }
    }
  };

  return (
    <Box className="statistics-container">
      {/* Sidebar */}
      <Box className="sidebar">
        <HomeIcon className="sidebar-icon" onClick={navigateToDashboard} />
        <ShowChartIcon className="sidebar-icon" sx={{ backgroundColor: '#d1c4e9' }} /> {/* Active icon */}
        <AccountBalanceWalletIcon className="sidebar-icon" />
        <PeopleIcon className="sidebar-icon" />
        <SettingsIcon className="sidebar-icon" />
      </Box>

      {/* Main Content */}
      <Box className="statistics-main-content">
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
              {mockData.monthlyTotals.income} zł
            </Typography>
          </Paper>
          
          <Paper className="summary-card">
            <Typography className="summary-label">
              Total Expenses
            </Typography>
            <Typography className="summary-value">
              {mockData.monthlyTotals.expense} zł
            </Typography>
          </Paper>
          
          <Paper className="summary-card">
            <Typography className="summary-label">
              Net Savings
            </Typography>
            <Typography className="summary-value">
              {mockData.monthlyTotals.income - mockData.monthlyTotals.expense} zł
            </Typography>
          </Paper>
          
          <Paper className="summary-card">
            <Typography className="summary-label">
              Savings Rate
            </Typography>
            <Typography className="summary-value">
              {mockData.savingsRate}%
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
              <Pie data={categoryBreakdownData} />
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

        {/* Financial Insights */}
        <Paper className="insights-section">
          <Typography variant="h6" className="insights-title">
            Financial Insights
          </Typography>
          
          <Box className="insight-item">
            <TrendingUpIcon className="insight-icon" />
            <Typography className="insight-text">
              Your highest income was {mockData.highestIncome} zł.
            </Typography>
          </Box>
          
          <Box className="insight-item">
            <TrendingDownIcon className="insight-icon" />
            <Typography className="insight-text">
              Your largest expense category is {mockData.topExpenseCategory}.
            </Typography>
          </Box>
          
          <Box className="insight-item">
            <InsightsIcon className="insight-icon" />
            <Typography className="insight-text">
              Your savings rate is {mockData.savingsRate}%, {parseFloat(mockData.savingsRate) > 20 ? 'which is good! Try to maintain above 20%.' : 'which could be improved. Aim for at least 20%.'}
            </Typography>
          </Box>
          
          <Box className="insight-item">
            <InsightsIcon className="insight-icon" />
            <Typography className="insight-text">
              {mockData.monthlyTotals.income > mockData.monthlyTotals.expense * 1.5 
                ? 'Great job! Your income is significantly higher than your expenses.'
                : 'Consider ways to increase your income or reduce expenses to improve your financial health.'}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Statistics; 