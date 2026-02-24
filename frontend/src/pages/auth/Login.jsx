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
} from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import useAuthStore from '../../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData);
      
      // Navigate based on role
      switch (user.role) {
        case 'super_admin':
          navigate('/super-admin/dashboard');
          break;
        case 'business_owner':
          navigate('/business-owner/dashboard');
          break;
        case 'client':
          navigate('/client/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Container maxWidth="sm">
        <Paper elevation={3} className="p-8">
          <Box className="text-center mb-6">
            <AccountBalance className="text-primary-600 mb-4" style={{ fontSize: 60 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Recovery Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="current-password"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              className="mt-6"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box className="text-center mt-4">
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:underline font-semibold">
                  Register Business
                </Link>
              </Typography>
            </Box>

            <Box className="mt-6 p-4 bg-blue-50 rounded-lg">
              <Typography variant="caption" display="block" className="mb-2 font-semibold">
                Demo Credentials:
              </Typography>
              <Typography variant="caption" display="block">
                Super Admin: admin@saas.com / admin123
              </Typography>
              <Typography variant="caption" display="block">
                Business Owner: owner@business.com / owner123
              </Typography>
              <Typography variant="caption" display="block">
                Client: john@example.com / client123
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default Login;
