import { useEffect, useState } from 'react';
import { Grid, Typography, Box, Card, CardContent } from '@mui/material';
import { People, AttachMoney, AccessTime, Stars } from '@mui/icons-material';
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
} from 'recharts';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';

const BusinessOwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyChart, setDailyChart] = useState([]);
  const [monthlyChart, setMonthlyChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, dailyRes, monthlyRes] = await Promise.all([
        api.get('/business-owner/dashboard'),
        api.get('/business-owner/dashboard/daily-chart?days=7'),
        api.get('/business-owner/dashboard/monthly-chart?months=6'),
      ]);

      setStats(statsRes.data.data);
      setDailyChart(dailyRes.data.data);
      setMonthlyChart(monthlyRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  return (
    <div>
      <Box className="mb-6">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your recovery management system
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Recovery Today"
            value={`PKR ${stats.totalRecoveryToday?.toFixed(2) || 0}`}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Pending"
            value={`PKR ${stats.totalPending?.toFixed(2) || 0}`}
            icon={<AccessTime />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Coins Issued"
            value={stats.totalCoinsIssued}
            icon={<Stars />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Daily Recovery (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#2196f3"
                    strokeWidth={2}
                    name="Amount"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Monthly Recovery (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#4caf50" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default BusinessOwnerDashboard;
