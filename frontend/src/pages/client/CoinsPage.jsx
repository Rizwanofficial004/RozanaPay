import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { Stars, EmojiEvents } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CoinsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [coinsToRedeem, setCoinsToRedeem] = useState('');

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    setLoading(true);
    try {
      const response = await api.get('/client/coins');
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setCoinsToRedeem('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleClaim = async () => {
    try {
      await api.post('/client/coins/claim', {
        coinsToRedeem: parseInt(coinsToRedeem),
      });
      handleCloseDialog();
      fetchCoins();
    } catch (error) {
      console.error('Failed to claim coins:', error);
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
          My Coins
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Earn and redeem coins for rewards
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box className="text-center">
                <Stars style={{ fontSize: 60 }} color="primary" />
                <Typography variant="h3" fontWeight="bold" className="my-4">
                  {data.balance}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Available Coins
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<EmojiEvents />}
                  onClick={handleOpenDialog}
                  disabled={data.balance < (data.coinRule?.minClaimCoins || 10)}
                  sx={{ mt: 3 }}
                >
                  Request Claim
                </Button>
                {data.balance < (data.coinRule?.minClaimCoins || 10) && (
                  <Typography variant="caption" color="text.secondary" className="mt-2">
                    Minimum {data.coinRule?.minClaimCoins || 10} coins required
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {data.coinRule && (
            <Card className="mt-3">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Coin Rules
                </Typography>
                <Box className="mt-3 space-y-2">
                  <Typography variant="body2" color="text.secondary">
                    <strong>Earning Rate:</strong> 1 coin per $
                    {data.coinRule.recoveryAmountPerCoin} paid
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Minimum to Claim:</strong> {data.coinRule.minClaimCoins} coins
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="mt-2">
                    {data.coinRule.coinValueDescription}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Coin Transaction History
              </Typography>

              <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No coin transactions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Chip
                              label={transaction.type}
                              color={transaction.type === 'earned' ? 'success' : 'info'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              fontWeight="bold"
                              color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                            >
                              {transaction.amount > 0 ? '+' : ''}
                              {transaction.amount}
                            </Typography>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Claim Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Request Coin Claim</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              You currently have <strong>{data.balance} coins</strong> available. Please contact
              your business to process the claim after submission.
            </Alert>
            <TextField
              fullWidth
              label="Coins to Redeem"
              type="number"
              value={coinsToRedeem}
              onChange={(e) => setCoinsToRedeem(e.target.value)}
              inputProps={{
                min: data.coinRule?.minClaimCoins || 10,
                max: data.balance,
              }}
              helperText={`Min: ${data.coinRule?.minClaimCoins || 10}, Max: ${data.balance}`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleClaim}
            variant="contained"
            disabled={
              !coinsToRedeem ||
              parseInt(coinsToRedeem) < (data.coinRule?.minClaimCoins || 10) ||
              parseInt(coinsToRedeem) > data.balance
            }
          >
            Submit Claim Request
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CoinsPage;
