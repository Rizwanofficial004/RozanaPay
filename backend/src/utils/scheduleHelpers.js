// Calculate the next run date for a schedule
export const calculateNextRunDate = (enabledDays, excludedDates, startDate, endDate) => {
  if (!enabledDays || enabledDays.length === 0) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : null;
  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  // Start checking from the later of today or startDate
  let checkDate = new Date(Math.max(today.getTime(), start.getTime()));

  // Convert excluded dates to strings for easier comparison
  const excludedDateStrings = excludedDates.map((date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  });

  // Check up to 365 days ahead
  for (let i = 0; i < 365; i++) {
    const dayOfWeek = checkDate.getDay();
    const dateString = checkDate.toISOString().split('T')[0];

    // Check if this day is enabled
    if (enabledDays.includes(dayOfWeek)) {
      // Check if not in excluded dates
      if (!excludedDateStrings.includes(dateString)) {
        // Check if within end date
        if (!end || checkDate <= end) {
          return checkDate;
        }
      }
    }

    // Move to next day
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return null; // No valid date found
};

// Check if a schedule should run today
export const shouldRunToday = (schedule, today, dayOfWeek) => {
  // Check if today's day is enabled
  if (!schedule.enabledDays.includes(dayOfWeek)) {
    return false;
  }

  // Check excluded dates
  const todayStr = today.toISOString().split('T')[0];
  if (
    schedule.excludedDates.some(
      (date) => new Date(date).toISOString().split('T')[0] === todayStr
    )
  ) {
    return false;
  }

  // Check if already ran today
  if (schedule.lastRunDate) {
    const lastRunStr = new Date(schedule.lastRunDate)
      .toISOString()
      .split('T')[0];
    if (lastRunStr === todayStr) {
      return false;
    }
  }

  return true;
};

// Validate enabled days array
export const validateEnabledDays = (enabledDays) => {
  if (!Array.isArray(enabledDays)) {
    return false;
  }

  if (enabledDays.length === 0) {
    return false;
  }

  // Check all values are integers between 0-6
  return enabledDays.every(
    (day) => Number.isInteger(day) && day >= 0 && day <= 6
  );
};

// Format schedule summary for display
export const formatScheduleSummary = (schedule) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const enabledDayNames = schedule.enabledDays
    .sort()
    .map((day) => dayNames[day]);

  let summary = '';

  if (schedule.enabledDays.length === 7) {
    summary = 'Every day';
  } else if (
    schedule.enabledDays.length === 5 &&
    !schedule.enabledDays.includes(0) &&
    !schedule.enabledDays.includes(6)
  ) {
    summary = 'Weekdays';
  } else if (
    schedule.enabledDays.length === 2 &&
    schedule.enabledDays.includes(0) &&
    schedule.enabledDays.includes(6)
  ) {
    summary = 'Weekends';
  } else if (schedule.enabledDays.length === 1) {
    summary = `Every ${dayNames[schedule.enabledDays[0]]}`;
  } else {
    summary = enabledDayNames.join(', ');
  }

  return summary;
};

// Get day name from day number
export const getDayName = (dayNumber) => {
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return dayNames[dayNumber] || 'Unknown';
};
