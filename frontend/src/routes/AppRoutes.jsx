import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Super Admin Pages
import SuperAdminDashboard from '../pages/super-admin/Dashboard';
import BusinessesPage from '../pages/super-admin/BusinessesPage';
import AnalyticsPage from '../pages/super-admin/AnalyticsPage';

// Business Owner Pages
import BusinessOwnerDashboard from '../pages/business-owner/Dashboard';
import ClientsPage from '../pages/business-owner/ClientsPage';
import RecoveryTransactionsPage from '../pages/business-owner/RecoveryTransactionsPage';
import SchedulesPage from '../pages/business-owner/SchedulesPage';
import CoinRulesPage from '../pages/business-owner/CoinRulesPage';
import ReportsPage from '../pages/business-owner/ReportsPage';

// Client Pages
import ClientDashboard from '../pages/client/Dashboard';
import TransactionHistory from '../pages/client/TransactionHistory';
import CoinsPage from '../pages/client/CoinsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuthStore();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'super_admin':
        return '/super-admin/dashboard';
      case 'business_owner':
        return '/business-owner/dashboard';
      case 'client':
        return '/client/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={getDefaultRoute()} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={getDefaultRoute()} />} />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin/*"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="businesses" element={<BusinessesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Business Owner Routes */}
      <Route
        path="/business-owner/*"
        element={
          <ProtectedRoute allowedRoles={['business_owner']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<BusinessOwnerDashboard />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="transactions" element={<RecoveryTransactionsPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="coin-rules" element={<CoinRulesPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* Client Routes */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="transactions" element={<TransactionHistory />} />
        <Route path="coins" element={<CoinsPage />} />
      </Route>

      {/* Default Route */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
};

export default AppRoutes;
