import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  AccountBalance,
  CreditCard,
  Settings,
  AccountCircle,
  ExitToApp,
  Business,
  EmojiEvents,
  Receipt,
  Assessment,
  Schedule,
} from '@mui/icons-material';
import useAuthStore from '../store/authStore';

const drawerWidth = 260;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { text: 'Dashboard', icon: <Dashboard />, path: '/super-admin/dashboard' },
          { text: 'Businesses', icon: <Business />, path: '/super-admin/businesses' },
          { text: 'Analytics', icon: <Assessment />, path: '/super-admin/analytics' },
        ];
      case 'business_owner':
        return [
          { text: 'Dashboard', icon: <Dashboard />, path: '/business-owner/dashboard' },
          { text: 'Clients', icon: <People />, path: '/business-owner/clients' },
          { text: 'Transactions', icon: <Receipt />, path: '/business-owner/transactions' },
          { text: 'Schedules', icon: <Schedule />, path: '/business-owner/schedules' },
          { text: 'Coin Rules', icon: <EmojiEvents />, path: '/business-owner/coin-rules' },
          { text: 'Reports', icon: <Assessment />, path: '/business-owner/reports' },
        ];
      case 'client':
        return [
          { text: 'Dashboard', icon: <Dashboard />, path: '/client/dashboard' },
          { text: 'Transactions', icon: <Receipt />, path: '/client/transactions' },
          { text: 'My Coins', icon: <EmojiEvents />, path: '/client/coins' },
        ];
      default:
        return [];
    }
  };

  const drawer = (
    <div>
      <Box className="p-6">
        <Box className="flex items-center gap-2">
          <AccountBalance className="text-primary-600" style={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight="bold" color="primary">
            Recovery SaaS
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" className="mt-2">
          {user?.role?.replace('_', ' ').toUpperCase()}
        </Typography>
      </Box>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.business?.name || user?.name}
          </Typography>
          <Box>
            <IconButton onClick={handleMenuOpen} size="large">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem disabled>
                <AccountCircle sx={{ mr: 1 }} />
                {user?.email}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
