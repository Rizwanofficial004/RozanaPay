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
  IconButton,
  TextField,
  Button,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Refresh, Analytics } from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import ClientDetailsDialog from '../../components/ClientDetailsDialog';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  useEffect(() => {
    fetchClients();
  }, [page, rowsPerPage, search]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/business-owner/clients', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search,
        },
      });
      setClients(response.data.data.clients);
      setTotalCount(response.data.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (client = null) => {
    if (client) {
      setEditMode(true);
      setCurrentClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        address: client.address || '',
        password: '',
      });
    } else {
      setEditMode(false);
      setCurrentClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentClient(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/business-owner/clients/${currentClient.id}`, formData);
        toast.success('Client updated successfully');
      } else {
        await api.post('/business-owner/clients', formData);
        toast.success('Client created successfully');
      }
      handleCloseDialog();
      fetchClients();
    } catch (error) {
      console.error('Failed to save client:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/business-owner/clients/${id}`);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  return (
    <div>
      <Box className="mb-6">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Manage Clients
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add, edit, and manage your clients
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box className="flex justify-between items-center mb-4">
            <TextField
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ width: 300 }}
            />
            <Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchClients}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Add Client
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="center">Coins</TableCell>
                  <TableCell align="center">Transactions</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell align="center">{client.coinWallet?.balance || 0}</TableCell>
                      <TableCell align="center">{client._count.recoveryTransactions}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setOpenDetailsDialog(true);
                          }}
                          title="View Analytics"
                        >
                          <Analytics />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(client)}
                          title="Edit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(client.id)}
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

      {/* Client Details Dialog */}
      <ClientDetailsDialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        clientId={selectedClientId}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editMode ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={editMode}
                />
              </Grid>
              {!editMode && (
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
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
