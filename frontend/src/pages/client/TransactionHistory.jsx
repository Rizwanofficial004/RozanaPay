import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
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
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import api from '../../services/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage, statusFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/client/transactions', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter,
        },
      });
      setTransactions(response.data.data.transactions);
      setTotalCount(response.data.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Box className="mb-6">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Transaction History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View all your recovery transactions
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box className="mb-4">
            <FormControl size="small" sx={{ width: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;
