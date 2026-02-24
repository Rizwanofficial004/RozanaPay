import { useEffect, useState } from 'react';
import { Grid, Typography, Box, Card, CardContent } from '@mui/material';
import { AttachMoney, AccessTime, Receipt, Stars } from '@mui/icons-material';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard';

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/client/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
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
          My Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {data.client.name}!
        </Typography>
      </Box>

      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Amount"
            value={`PKR ${data.totalPending?.toFixed(2) || 0}`}
            icon={<AccessTime />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Paid"
            value={`$${data.totalPaid?.toFixed(2) || 0}`}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Transactions"
            value={data.totalTransactions}
            icon={<Receipt />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Coin Balance"
            value={data.coinBalance}
            icon={<Stars />}
            color="primary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Account Information
              </Typography>
              <Box className="mt-4 space-y-3">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{data.client.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{data.client.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{data.client.phone || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">{data.client.address || 'Not provided'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Stats
              </Typography>
              <Box className="mt-4">
                <Box className="flex justify-between items-center py-3 border-b">
                  <Typography variant="body2" color="text.secondary">
                    Member Since
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(data.client.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box className="flex justify-between items-center py-3 border-b">
                  <Typography variant="body2" color="text.secondary">
                    Total Amount Due
                  </Typography>
                  <Typography variant="h6" color="warning.main" fontWeight="bold">
                    PKR {data.totalPending?.toFixed(2) || 0}
                  </Typography>
                </Box>
                <Box className="flex justify-between items-center py-3">
                  <Typography variant="body2" color="text.secondary">
                    Available Coins
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {data.coinBalance} 🪙
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ClientDashboard;
