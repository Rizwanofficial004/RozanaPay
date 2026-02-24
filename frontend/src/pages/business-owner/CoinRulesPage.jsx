import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CoinRulesPage = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    recoveryAmountPerCoin: 100,
    minClaimCoins: 10,
    coinValueDescription: '1 coin = 1 unit value',
  });

  useEffect(() => {
    fetchCoinRules();
  }, []);

  const fetchCoinRules = async () => {
    try {
      const response = await api.get('/business-owner/coin-rules');
      if (response.data.data) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch coin rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/business-owner/coin-rules', formData);
      toast.success('Coin rules updated successfully!');
      fetchCoinRules();
    } catch (error) {
      console.error('Failed to update coin rules:', error);
    }
  };

  if (loading) {
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
          Coin Rules Configuration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure how coins are earned and redeemed by your clients
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Coins are automatically awarded to clients when their payments are marked as
                      paid. The system calculates: coins = floor(payment_amount / recovery_amount_per_coin)
                    </Alert>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Recovery Amount Per Coin (PKR)"
                      name="recoveryAmountPerCoin"
                      type="number"
                      value={formData.recoveryAmountPerCoin}
                      onChange={handleChange}
                      helperText="Amount of recovery required to earn 1 coin (e.g., 100 means client earns 1 coin for every PKR 100 paid)"
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Minimum Coins for Claim"
                      name="minClaimCoins"
                      type="number"
                      value={formData.minClaimCoins}
                      onChange={handleChange}
                      helperText="Minimum number of coins required before a client can request a claim"
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Coin Value Description"
                      name="coinValueDescription"
                      value={formData.coinValueDescription}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      helperText="Description of what coins are worth (shown to clients)"
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Save />}
                    >
                      Save Coin Rules
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Example Calculation
              </Typography>
              <Box className="mt-4">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  If a client pays $
                  {formData.recoveryAmountPerCoin ? formData.recoveryAmountPerCoin * 3.5 : 350}:
                </Typography>
                <Typography variant="h5" className="mt-2 mb-4">
                  Coins Earned:{' '}
                  {Math.floor(
                    (formData.recoveryAmountPerCoin ? formData.recoveryAmountPerCoin * 3.5 : 350) /
                      (formData.recoveryAmountPerCoin || 100)
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Minimum coins to claim: {formData.minClaimCoins}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default CoinRulesPage;
