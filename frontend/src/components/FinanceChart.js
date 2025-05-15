import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Grid,
  useTheme
} from '@mui/material';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

const CHART_TYPES = {
  AREA: 'area',
  PIE: 'pie',
  BAR: 'bar',
  LINE: 'line'
};

const TIME_PERIODS = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CUSTOM: 'custom'
};

const FinanceChart = ({ 
  data,
  title = 'Finance Overview',
  defaultChartType = CHART_TYPES.AREA,
  defaultTimePeriod = TIME_PERIODS.MONTHLY,
  height = 400,
  allowedCharts = [CHART_TYPES.AREA, CHART_TYPES.PIE, CHART_TYPES.BAR, CHART_TYPES.LINE],
  showCategoryBreakdown = true,
  compareIncomeVsExpense = true,
  onFilterChange = null
}) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState(defaultChartType);
  const [timePeriod, setTimePeriod] = useState(defaultTimePeriod);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300'
  ];

  const handleChartTypeChange = (event, newValue) => {
    setChartType(newValue);
  };

  const handleTimePeriodChange = (event) => {
    const newPeriod = event.target.value;
    setTimePeriod(newPeriod);
    if (onFilterChange) {
      onFilterChange({ timePeriod: newPeriod, chartType });
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1, backgroundColor: '#fff', boxShadow: 2, border: 'none' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={`tooltip-item-${index}`} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Box 
                component="span" 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  backgroundColor: entry.color, 
                  borderRadius: '50%',
                  mr: 1,
                  display: 'inline-block'
                }}
              />
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                {entry.name}:
              </Typography>
              <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(entry.value)}
              </Typography>
            </Box>
          ))}
        </Card>
      );
    }
    return null;
  };

  // Render the appropriate chart based on chartType
  const renderChart = () => {
    switch (chartType) {
      case CHART_TYPES.PIE:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={130}
                fill="#8884d8"
                dataKey="amount"
                nameKey="category"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case CHART_TYPES.BAR:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" name="Income" fill={theme.palette.success.main} />
              <Bar dataKey="expense" name="Expense" fill={theme.palette.error.main} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case CHART_TYPES.LINE:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Income"
                stroke={theme.palette.success.main} 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name="Expense"
                stroke={theme.palette.error.main} 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                name="Balance"
                stroke={theme.palette.primary.main} 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case CHART_TYPES.AREA:
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                name="Income"
                stroke={theme.palette.success.main} 
                fill={theme.palette.success.light} 
                fillOpacity={0.3}
                stackId={compareIncomeVsExpense ? 0 : 1}
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                name="Expense"
                stroke={theme.palette.error.main} 
                fill={theme.palette.error.light} 
                fillOpacity={0.3}
                stackId={compareIncomeVsExpense ? 0 : 2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render category breakdown if needed (for use in Statistics page)
  const renderCategoryBreakdown = () => {
    if (!showCategoryBreakdown) return null;

    // Assuming we have category data
    const categoryData = [
      { name: 'Food', value: 400 },
      { name: 'Housing', value: 800 },
      { name: 'Transportation', value: 300 },
      { name: 'Entertainment', value: 200 },
      { name: 'Healthcare', value: 150 },
    ];

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense by Category
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatCurrency} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="time-period-label">Time Period</InputLabel>
            <Select
              labelId="time-period-label"
              value={timePeriod}
              onChange={handleTimePeriodChange}
              label="Time Period"
            >
              <MenuItem value={TIME_PERIODS.WEEKLY}>Weekly</MenuItem>
              <MenuItem value={TIME_PERIODS.MONTHLY}>Monthly</MenuItem>
              <MenuItem value={TIME_PERIODS.YEARLY}>Yearly</MenuItem>
              <MenuItem value={TIME_PERIODS.CUSTOM}>Custom</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Tabs 
          value={chartType} 
          onChange={handleChartTypeChange} 
          variant="fullWidth" 
          aria-label="chart type tabs"
          sx={{ mb: 2 }}
        >
          {allowedCharts.includes(CHART_TYPES.AREA) && (
            <Tab label="Area" value={CHART_TYPES.AREA} />
          )}
          {allowedCharts.includes(CHART_TYPES.BAR) && (
            <Tab label="Bar" value={CHART_TYPES.BAR} />
          )}
          {allowedCharts.includes(CHART_TYPES.LINE) && (
            <Tab label="Line" value={CHART_TYPES.LINE} />
          )}
          {allowedCharts.includes(CHART_TYPES.PIE) && (
            <Tab label="Pie" value={CHART_TYPES.PIE} />
          )}
        </Tabs>

        {renderChart()}
        {renderCategoryBreakdown()}
      </CardContent>
    </Card>
  );
};

export default FinanceChart; 