import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Download, FileDownload } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [detailedData, setDetailedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/business-owner/reports', {
        params: {
          type: reportType,
          startDate,
          endDate,
        },
      });

      if (reportType === 'summary') {
        setSummaryData(response.data.data);
      } else {
        setDetailedData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (exportType) => {
    try {
      const response = await api.get('/business-owner/export', {
        params: {
          type: exportType,
          startDate,
          endDate,
        },
      });

      // Convert to CSV and download
      const data = response.data.data;
      if (data && data.length > 0) {
        const keys = Object.keys(data[0]);
        const csvContent = [
          keys.join(','),
          ...data.map(row => keys.map(key => JSON.stringify(row[key] || '')).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();

        toast.success('Export downloaded successfully!');
      } else {
        toast.error('No data to export');
      }
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  return (
    <div>
      <Box className="mb-6">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Reports & Export
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate reports and export data
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="summary">Summary</MenuItem>
                  <MenuItem value="detailed">Detailed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={fetchReport}
                disabled={loading}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {reportType === 'summary' && summaryData && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Clients
                </Typography>
                <Typography variant="h4">{summaryData.totalClients}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h4">{summaryData.totalTransactions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" color="success.main">
                  ${summaryData.totalRevenue?.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Avg Transaction
                </Typography>
                <Typography variant="h4">
                  ${summaryData.averageTransactionValue?.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Status
                </Typography>
                <Box className="flex justify-around mt-4">
                  <Box className="text-center">
                    <Typography variant="h5" color="success.main">
                      {summaryData.paidTransactions}
                    </Typography>
                    <Typography variant="caption">Paid</Typography>
                  </Box>
                  <Box className="text-center">
                    <Typography variant="h5" color="warning.main">
                      {summaryData.pendingTransactions}
                    </Typography>
                    <Typography variant="caption">Pending</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Summary
                </Typography>
                <Box className="flex justify-around mt-4">
                  <Box className="text-center">
                    <Typography variant="h5" color="success.main">
                      ${summaryData.totalRevenue?.toFixed(2)}
                    </Typography>
                    <Typography variant="caption">Revenue</Typography>
                  </Box>
                  <Box className="text-center">
                    <Typography variant="h5" color="warning.main">
                      PKR {summaryData.totalPending?.toFixed(2)}
                    </Typography>
                    <Typography variant="caption">Pending</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {reportType === 'detailed' && detailedData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detailed Transaction Report
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailedData.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.client.name}</TableCell>
                      <TableCell align="right">
                        PKR {transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={transaction.status === 'paid' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{transaction.paymentMethod || '-'}</TableCell>
                      <TableCell>{transaction.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Export Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export your data as CSV files
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => handleExport('clients')}
              >
                Export Clients
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => handleExport('transactions')}
              >
                Export Transactions
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={() => handleExport('coins')}
              >
                Export Coin History
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;