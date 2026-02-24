import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Chip,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close as CloseIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

const ScheduleFormDialog = ({ open, onClose, onSuccess, schedule, clients }) => {
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    amount: '',
    frequency: 'custom',
    enabledDays: [],
    excludedDates: [],
    startDate: new Date(),
    endDate: null,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schedule) {
      setFormData({
        name: schedule.name,
        clientId: schedule.clientId,
        amount: schedule.amount,
        frequency: schedule.frequency,
        enabledDays: schedule.enabledDays,
        excludedDates: schedule.excludedDates.map((date) => new Date(date)),
        startDate: new Date(schedule.startDate),
        endDate: schedule.endDate ? new Date(schedule.endDate) : null,
        isActive: schedule.isActive,
      });
    } else {
      setFormData({
        name: '',
        clientId: '',
        amount: '',
        frequency: 'custom',
        enabledDays: [],
        excludedDates: [],
        startDate: new Date(),
        endDate: null,
        isActive: true,
      });
    }
  }, [schedule, open]);

  const handleDayToggle = (event, newDays) => {
    if (newDays.length > 0) {
      setFormData({ ...formData, enabledDays: newDays.sort() });
    }
  };

  const handleFrequencyChange = (freq) => {
    let enabledDays = [];
    switch (freq) {
      case 'daily':
        enabledDays = [0, 1, 2, 3, 4, 5, 6];
        break;
      case 'weekdays':
        enabledDays = [1, 2, 3, 4, 5];
        break;
      case 'weekly':
        enabledDays = [1]; // Default to Monday
        break;
      default:
        enabledDays = formData.enabledDays;
    }
    setFormData({ ...formData, frequency: freq, enabledDays });
  };

  const handleAddExcludedDate = (date) => {
    if (date && !formData.excludedDates.some((d) => d.getTime() === date.getTime())) {
      setFormData({
        ...formData,
        excludedDates: [...formData.excludedDates, date],
      });
    }
  };

  const handleRemoveExcludedDate = (index) => {
    const newExcludedDates = formData.excludedDates.filter((_, i) => i !== index);
    setFormData({ ...formData, excludedDates: newExcludedDates });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.clientId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.enabledDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        excludedDates: formData.excludedDates.map((date) => date.toISOString()),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
      };

      if (schedule) {
        await api.put(`/business-owner/schedules/${schedule.id}`, payload);
        toast.success('Schedule updated successfully');
      } else {
        await api.post('/business-owner/schedules', payload);
        toast.success('Schedule created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error(error.response?.data?.message || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const dayNames = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {schedule ? 'Edit Schedule' : 'Create New Schedule'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Schedule Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Schedule Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Daily Recovery - Shop A"
                required
              />
            </Grid>

            {/* Client Selection */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={clients || []}
                getOptionLabel={(option) => option.name || ''}
                value={clients?.find((c) => c.id === formData.clientId) || null}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, clientId: newValue ? newValue.id : '' });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Client *" required />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>

            {/* Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Amount (PKR)"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                required
                placeholder="e.g., 1000"
              />
            </Grid>

            {/* Frequency Presets */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Frequency Preset
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant={formData.frequency === 'daily' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleFrequencyChange('daily')}
                >
                  Every Day
                </Button>
                <Button
                  variant={formData.frequency === 'weekdays' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleFrequencyChange('weekdays')}
                >
                  Weekdays Only
                </Button>
                <Button
                  variant={formData.frequency === 'weekly' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleFrequencyChange('weekly')}
                >
                  Weekly
                </Button>
                <Button
                  variant={formData.frequency === 'custom' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleFrequencyChange('custom')}
                >
                  Custom
                </Button>
              </Box>
            </Grid>

            {/* Day Selector */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Select Days *
              </Typography>
              <ToggleButtonGroup
                value={formData.enabledDays}
                onChange={handleDayToggle}
                aria-label="days of week"
                sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 1 }}
              >
                {dayNames.map((day) => (
                  <ToggleButton
                    key={day.value}
                    value={day.value}
                    aria-label={day.label}
                    sx={{
                      flex: '1 1 auto',
                      minWidth: '60px',
                      border: '1px solid #ddd',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                    }}
                  >
                    {day.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Selected: {formData.enabledDays.length} day(s)
              </Typography>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date (Optional)"
                  value={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={formData.startDate}
                />
              </LocalizationProvider>
            </Grid>

            {/* Excluded Dates */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Exclude Specific Dates (Holidays, etc.)
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Add Excluded Date"
                  value={null}
                  onChange={handleAddExcludedDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
              {formData.excludedDates.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                  {formData.excludedDates.map((date, index) => (
                    <Chip
                      key={index}
                      label={date.toLocaleDateString()}
                      onDelete={() => handleRemoveExcludedDate(index)}
                      color="warning"
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </Grid>

            {/* Active Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                }
                label="Active (Schedule will run automatically)"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          {loading ? 'Saving...' : schedule ? 'Update Schedule' : 'Create Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleFormDialog;
