import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import ScheduleFormDialog from '../../components/ScheduleFormDialog';

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchSchedules();
    fetchClients();
  }, [page, rowsPerPage, filterClient, filterStatus]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (filterClient) params.clientId = filterClient;
      if (filterStatus !== '') params.isActive = filterStatus;

      const response = await api.get('/business-owner/schedules', { params });
      setSchedules(response.data.schedules);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/business-owner/clients', {
        params: { limit: 1000 },
      });
      // API returns { success: true, data: { clients: [...] } }
      const clientsData = response.data.data?.clients || [];
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const handleAddSchedule = () => {
    setSelectedSchedule(null);
    setOpenFormDialog(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setOpenFormDialog(true);
  };

  const handleDeleteClick = (schedule) => {
    setSelectedSchedule(schedule);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/business-owner/schedules/${selectedSchedule.id}`);
      toast.success('Schedule deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error(error.response?.data?.message || 'Failed to delete schedule');
    }
  };

  const handleToggleStatus = async (schedule) => {
    try {
      await api.patch(`/business-owner/schedules/${schedule.id}/toggle`);
      toast.success(
        `Schedule ${schedule.isActive ? 'deactivated' : 'activated'} successfully`
      );
      fetchSchedules();
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast.error('Failed to update schedule status');
    }
  };

  const handleFormSuccess = () => {
    setOpenFormDialog(false);
    setSelectedSchedule(null);
    fetchSchedules();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDays = (enabledDays) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (enabledDays.length === 7) return 'Every day';
    if (
      enabledDays.length === 5 &&
      !enabledDays.includes(0) &&
      !enabledDays.includes(6)
    ) {
      return 'Weekdays';
    }
    return enabledDays
      .sort()
      .map((day) => dayNames[day])
      .join(', ');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Recurring Schedules
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage automated transaction schedules for clients
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSchedule}
          sx={{ textTransform: 'none' }}
        >
          Add Schedule
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2}>
          <Autocomplete
            options={clients || []}
            getOptionLabel={(option) => option.name || ''}
            value={clients?.find((c) => c.id === filterClient) || null}
            onChange={(event, newValue) => {
              setFilterClient(newValue ? newValue.id : '');
            }}
            renderInput={(params) => (
              <TextField {...params} label="Filter by Client" size="small" />
            )}
            sx={{ minWidth: 250 }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
          <TextField
            select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Schedules Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>
                <strong>Schedule Name</strong>
              </TableCell>
              <TableCell>
                <strong>Client</strong>
              </TableCell>
              <TableCell>
                <strong>Amount</strong>
              </TableCell>
              <TableCell>
                <strong>Days</strong>
              </TableCell>
              <TableCell>
                <strong>Last Run</strong>
              </TableCell>
              <TableCell>
                <strong>Next Run</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading schedules...
                </TableCell>
              </TableRow>
            ) : schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box py={4}>
                    <ScheduleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No schedules found. Create your first schedule!
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id} hover>
                  <TableCell>{schedule.name}</TableCell>
                  <TableCell>{schedule.client?.name || 'N/A'}</TableCell>
                  <TableCell>PKR {schedule.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {formatDays(schedule.enabledDays)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(schedule.lastRunDate)}</TableCell>
                  <TableCell>{formatDate(schedule.nextRunDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.isActive ? 'Active' : 'Inactive'}
                      color={schedule.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color={schedule.isActive ? 'warning' : 'success'}
                      onClick={() => handleToggleStatus(schedule)}
                      title={schedule.isActive ? 'Pause' : 'Activate'}
                    >
                      {schedule.isActive ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(schedule)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Schedule Form Dialog */}
      <ScheduleFormDialog
        open={openFormDialog}
        onClose={() => {
          setOpenFormDialog(false);
          setSelectedSchedule(null);
        }}
        onSuccess={handleFormSuccess}
        schedule={selectedSchedule}
        clients={clients}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Schedule</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the schedule "
            {selectedSchedule?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchedulesPage;
