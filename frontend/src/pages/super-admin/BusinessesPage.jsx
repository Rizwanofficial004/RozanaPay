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
  IconButton,
  TextField,
  Button,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import { Add, Refresh, ToggleOn, ToggleOff, Visibility, Edit, Delete, Info } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { toast } from 'react-toastify';

const BusinessesPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [detailsTab, setDetailsTab] = useState(0);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [createFormData, setCreateFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchBusinesses();
  }, [page, rowsPerPage, search]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/super-admin/businesses', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search,
        },
      });
      setBusinesses(response.data.data.businesses);
      setTotalCount(response.data.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessDetails = async (id) => {
    try {
      const response = await api.get(`/super-admin/businesses/${id}`);
      setBusinessDetails(response.data.data);
    } catch (error) {
      console.error('Failed to fetch business details:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/super-admin/businesses/${id}/toggle-status`);
      toast.success('Business status updated');
      fetchBusinesses();
      if (businessDetails && businessDetails.id === id) {
        fetchBusinessDetails(id);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleOpenDetails = async (business) => {
    setSelectedBusiness(business);
    setOpenDetailsDialog(true);
    setDetailsTab(0);
    await fetchBusinessDetails(business.id);
  };

  const handleCloseDetails = () => {
    setOpenDetailsDialog(false);
    setSelectedBusiness(null);
    setBusinessDetails(null);
  };

  const handleOpenEdit = (business) => {
    setSelectedBusiness(business);
    setEditFormData({
      name: business.name,
      email: business.email,
      phone: business.phone || '',
      address: business.address || '',
    });
    setOpenEditDialog(true);
  };

  const handleCloseEdit = () => {
    setOpenEditDialog(false);
    setSelectedBusiness(null);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/super-admin/businesses/${selectedBusiness.id}`, editFormData);
      toast.success('Business updated successfully');
      handleCloseEdit();
      fetchBusinesses();
    } catch (error) {
      console.error('Failed to update business:', error);
    }
  };

  const handleDelete = async (business) => {
    if (window.confirm(`Are you sure you want to delete "${business.name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/super-admin/businesses/${business.id}`);
        toast.success('Business deleted successfully');
        fetchBusinesses();
      } catch (error) {
        console.error('Failed to delete business:', error);
      }
    }
  };

  const handleOpenCreate = () => {
    setCreateFormData({
      businessName: '',
      ownerName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
    });
    setOpenCreateDialog(true);
  };

  const handleCloseCreate = () => {
    setOpenCreateDialog(false);
  };

  const handleCreateChange = (e) => {
    setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/super-admin/businesses', createFormData);
      toast.success('Business created successfully');
      handleCloseCreate();
      fetchBusinesses();
    } catch (error) {
      console.error('Failed to create business:', error);
    }
  };

  const revenueChartData = businessDetails?.revenueByMonth 
    ? Object.keys(businessDetails.revenueByMonth).map(month => ({
        month: month.substring(5),
        revenue: businessDetails.revenueByMonth[month],
      }))
    : [];

  return (
    <div>
      <Box className="mb-6">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Manage Businesses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View, edit, and manage all registered businesses
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box className="flex justify-between items-center mb-4">
            <TextField
              placeholder="Search businesses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ width: 300 }}
            />
            <Box className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchBusinesses}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenCreate}
              >
                Add Business
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Business Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="center">Clients</TableCell>
                  <TableCell align="center">Transactions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No businesses found
                    </TableCell>
                  </TableRow>
                ) : (
                  businesses.map((business) => (
                    <TableRow key={business.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{business.name}</Typography>
                      </TableCell>
                      <TableCell>{business.email}</TableCell>
                      <TableCell>{business.phone || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip label={business._count.clients} color="info" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={business._count.recoveryTransactions} color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={business.isActive ? 'Active' : 'Inactive'}
                          color={business.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenDetails(business)}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(business)}
                          title="Edit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleToggleStatus(business.id)}
                          color={business.isActive ? 'error' : 'success'}
                          size="small"
                          title={business.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {business.isActive ? <ToggleOff /> : <ToggleOn />}
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(business)}
                          title="Delete"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
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

      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box className="flex justify-between items-center">
            <Typography variant="h6">{selectedBusiness?.name}</Typography>
            <Chip
              label={selectedBusiness?.isActive ? 'Active' : 'Inactive'}
              color={selectedBusiness?.isActive ? 'success' : 'error'}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={detailsTab} onChange={(e, v) => setDetailsTab(v)} sx={{ mb: 2 }}>
            <Tab label="Overview" />
            <Tab label="Clients" />
            <Tab label="Transactions" />
            <Tab label="Analytics" />
          </Tabs>

          {detailsTab === 0 && businessDetails && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contact Information
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Email" secondary={businessDetails.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Phone" secondary={businessDetails.phone || 'Not provided'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Address" secondary={businessDetails.address || 'Not provided'} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Statistics
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Total Clients" secondary={businessDetails._count.clients} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Total Transactions" secondary={businessDetails._count.recoveryTransactions} />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Total Revenue" 
                          secondary={`PKR ${businessDetails.totalRecovery?.toFixed(2) || 0}`}
                          secondaryTypographyProps={{ color: 'success.main', fontWeight: 'bold' }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Pending Amount" 
                          secondary={`PKR ${businessDetails.totalPending?.toFixed(2) || 0}`}
                          secondaryTypographyProps={{ color: 'warning.main', fontWeight: 'bold' }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              {businessDetails.users && businessDetails.users.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Business Owners
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      {businessDetails.users.map(user => (
                        <Box key={user.id} className="flex justify-between items-center py-2">
                          <Box>
                            <Typography variant="body2" fontWeight="medium">{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </Box>
                          <Typography variant="caption">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}

          {detailsTab === 1 && businessDetails && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Transactions</TableCell>
                    <TableCell align="right">Coins</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {businessDetails.clients?.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell align="right">{client._count.recoveryTransactions}</TableCell>
                      <TableCell align="right">{client.coinWallet?.balance || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {detailsTab === 2 && businessDetails && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {businessDetails.recentTransactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.client.name}</TableCell>
                      <TableCell align="right">PKR {transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={transaction.status === 'paid' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {detailsTab === 3 && businessDetails && revenueChartData.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Revenue Trend (Last 3 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#4caf50" strokeWidth={2} name="Revenue ($)" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <form onSubmit={handleEditSubmit}>
          <DialogTitle>Edit Business</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>Cancel</Button>
            <Button type="submit" variant="contained">
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create Business Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle>Add New Business</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              This will create a new business and automatically generate a business owner account.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={createFormData.businessName}
                  onChange={handleCreateChange}
                  required
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Owner Name"
                  name="ownerName"
                  value={createFormData.ownerName}
                  onChange={handleCreateChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={createFormData.email}
                  onChange={handleCreateChange}
                  required
                  helperText="This will be used for both business and owner login"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={createFormData.password}
                  onChange={handleCreateChange}
                  required
                  helperText="Password for the business owner account"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  name="phone"
                  value={createFormData.phone}
                  onChange={handleCreateChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address (Optional)"
                  name="address"
                  value={createFormData.address}
                  onChange={handleCreateChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreate}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Business
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default BusinessesPage;