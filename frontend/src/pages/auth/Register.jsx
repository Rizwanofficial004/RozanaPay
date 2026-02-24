import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Grid,
} from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import useAuthStore from '../../store/authStore';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/business-owner/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Container maxWidth="md">
        <Paper elevation={3} className="p-8">
          <Box className="text-center mb-6">
            <AccountBalance className="text-primary-600 mb-4" style={{ fontSize: 60 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Register Your Business
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create a new business account
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Owner Name"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address (Optional)"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Register Business'}
            </Button>

            <Box className="text-center mt-4">
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:underline font-semibold">
                  Sign In
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default Register;
