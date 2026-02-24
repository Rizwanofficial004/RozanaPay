import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
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
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#4caf50', '#ff9800', '#2196f3', '#f44336'];

const ClientDetailsDialog = ({ open, onClose, clientId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (open && clientId) {
      fetchDetails();
    }
  }, [open, clientId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/business-owner/clients/${clientId}/analytics`);
      setDetails(response.data.data);
    } catch (error) {
      console.error('Failed to fetch client details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  if (loading || !details) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box className="flex justify-center items-center" style={{ minHeight: 300 }}>
            <Typography>Loading client details...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  const paymentTrendsData = Object.keys(details.paymentTrends || {}).map(month => ({
    month: month.substring(5),
    amount: details.paymentTrends[month],
  }));

  const statusData = details.paymentStats?.map(stat => ({
    name: stat.status,
    value: stat._count,
  })) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h5" fontWeight="bold">{details.client.name}</Typography>
          <Typography variant="body2" color="text.secondary">{details.client.email}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="Transaction History" />
          <Tab label="Coin History" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Overview Tab */}
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Client Information
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Name" secondary={details.client.name} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Email" secondary={details.client.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Phone" secondary={details.client.phone || 'Not provided'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Address" secondary={details.client.address || 'Not provided'} />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Joined" 
                        secondary={new Date(details.client.createdAt).toLocaleDateString()} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Financial Summary
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Box className="text-center p-3">
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          ${details.totalPaid?.toFixed(2) || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Paid
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box className="text-center p-3">
                        <Typography variant="h4" color="warning.main" fontWeight="bold">
                          ${details.totalPending?.toFixed(2) || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pending
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box className="text-center p-3">
                        <Typography variant="h4" color="info.main" fontWeight="bold">
                          {details.paidCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Paid Trans.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box className="text-center p-3">
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                          ${details.averagePayment?.toFixed(2) || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Avg Payment
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box className="flex justify-between items-center p-2">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Coin Balance
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {details.client.coinWallet?.balance || 0} 🪙
                      </Typography>
                    </Box>
                    <Box className="text-right">
                      <Typography variant="body2" color="text.secondary">
                        Payment Rate
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {details.paidCount + details.pendingCount > 0
                          ? ((details.paidCount / (details.paidCount + details.pendingCount)) * 100).toFixed(1)
                          : 0}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Transaction History Tab */}
        {tab === 1 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Paid Date</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.transactionHistory?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Typography fontWeight="bold">PKR {transaction.amount.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={transaction.status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {transaction.dueDate
                        ? new Date(transaction.dueDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {transaction.paidDate
                        ? new Date(transaction.paidDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>{transaction.paymentMethod || '-'}</TableCell>
                    <TableCell>{transaction.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Coin History Tab */}
        {tab === 2 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.coinHistory?.map((coin) => (
                  <TableRow key={coin.id}>
                    <TableCell>
                      <Chip
                        label={coin.type}
                        color={coin.type === 'earned' ? 'success' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        fontWeight="bold"
                        color={coin.amount > 0 ? 'success.main' : 'error.main'}
                      >
                        {coin.amount > 0 ? '+' : ''}
                        {coin.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>{coin.description}</TableCell>
                    <TableCell>{new Date(coin.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Analytics Tab */}
        {tab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Payment Trends (Last 6 Months)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={paymentTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#4caf50"
                        strokeWidth={2}
                        name="Payment Amount ($)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Payment Status Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientDetailsDialog;