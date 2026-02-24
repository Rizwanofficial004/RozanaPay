import { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { Business, People, AttachMoney, Receipt, TrendingUp, TrendingDown } from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';

const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/super-admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Box className="flex justify-center items-center h-64">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const monthlyChartData = Object.keys(stats.monthlyData || {}).map(month => ({
    month: month.substring(5),
    revenue: stats.monthlyData[month].revenue,
    transactions: stats.monthlyData[month].transactions,
  }));

  const businessStatusData = [
    { name: 'Active', value: stats.activeBusinesses },
    { name: 'Inactive', value: stats.inactiveBusinesses },
  ];

  return (
    <div>
      <Box className="mb-6">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Super Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          System-wide overview and analytics
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Businesses"
            value={stats.totalBusinesses}
            icon={<Business />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Businesses"
            value={stats.activeBusinesses}
            icon={<Business />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Transactions"
            value={stats.totalTransactions}
            icon={<Receipt />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue?.toFixed(2) || 0}`}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatsCard
            title="Total Pending"
            value={`PKR ${stats.totalPending?.toFixed(2) || 0}`}
            icon={<AttachMoney />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Top Businesses" />
          <Tab label="Recent Activity" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Monthly Revenue & Transactions
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#4caf50" name="Revenue ($)" />
                    <Bar yAxisId="right" dataKey="transactions" fill="#2196f3" name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Business Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={businessStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {businessStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Top Performing Businesses
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Business Name</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Clients</TableCell>
                    <TableCell align="right">Transactions</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.topBusinesses?.map((business, index) => (
                    <TableRow key={business.id}>
                      <TableCell>
                        <Box className="flex items-center gap-2">
                          {index === 0 && <TrendingUp color="success" />}
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell>{business.name}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold" color="success.main">
                          ${business.revenue?.toFixed(2) || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{business.clientCount}</TableCell>
                      <TableCell align="right">{business.transactionCount}</TableCell>
                      <TableCell>
                        <Chip
                          label={business.isActive ? 'Active' : 'Inactive'}
                          color={business.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recently Registered Businesses
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Business Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Registered On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentBusinesses?.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>{business.name}</TableCell>
                      <TableCell>{business.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={business.isActive ? 'Active' : 'Inactive'}
                          color={business.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(business.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuperAdminDashboard;