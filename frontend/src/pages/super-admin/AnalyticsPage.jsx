import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import api from '../../services/api';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/super-admin/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <Box className="flex justify-center items-center h-64">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const dailyData = Object.keys(analytics.dailyStats || {}).map(date => ({
    date: date.substring(5),
    revenue: analytics.dailyStats[date].revenue,
    transactions: analytics.dailyStats[date].transactions,
    pending: analytics.dailyStats[date].pending,
  })).slice(-30);

  return (
    <div>
      <Box className="mb-6 flex justify-between items-center">
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            System Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Detailed analytics and performance metrics
          </Typography>
        </Box>
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7">Last 7 Days</MenuItem>
            <MenuItem value="30">Last 30 Days</MenuItem>
            <MenuItem value="90">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Daily Revenue & Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Daily Revenue & Transaction Trends
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4caf50"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue ($)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#ff9800"
                    fillOpacity={1}
                    fill="url(#colorPending)"
                    name="Pending (PKR)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Volume */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Transaction Volume
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transactions" fill="#2196f3" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Businesses */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Top 10 Businesses by Revenue
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.businessPerformance?.slice(0, 10)}
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={90} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#4caf50" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Performance Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Business Performance Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics.businessPerformance?.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#4caf50" name="Revenue ($)" />
                  <Bar yAxisId="right" dataKey="clients" fill="#2196f3" name="Clients" />
                  <Bar yAxisId="right" dataKey="transactions" fill="#ff9800" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default AnalyticsPage;