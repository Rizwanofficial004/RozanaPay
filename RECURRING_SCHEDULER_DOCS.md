# 🔄 Recurring Transaction Scheduler - Feature Documentation

## ✅ Implementation Complete

This document describes the newly implemented **Recurring Transaction Scheduler** feature for the Recovery Management SaaS system.

---

## 📋 Overview

The Recurring Transaction Scheduler allows business owners to automate the creation of recovery transactions based on customizable schedules. This eliminates manual daily data entry and ensures consistent transaction creation.

### Key Benefits
- ✅ **Automated Transaction Creation**: No manual entry needed
- ✅ **Flexible Scheduling**: Customize days, amounts, and frequencies per client
- ✅ **Holiday Support**: Exclude specific dates (holidays, closures)
- ✅ **Audit Trail**: Track when schedules run and what they create
- ✅ **Easy Management**: Enable/disable schedules anytime
- ✅ **Visual Indicators**: Auto-generated transactions are clearly marked

---

## 🏗️ Architecture

### Backend Components

#### 1. Database Model: RecurringSchedule
Location: `backend/prisma/schema.prisma`

Fields:
- `name`: Schedule identifier (e.g., "Daily Recovery - Shop A")
- `amount`: Transaction amount
- `frequency`: "daily", "weekly", "monthly", "custom"
- `enabledDays`: Array of days [0-6] (0=Sunday, 6=Saturday)
- `excludedDates`: Array of dates to skip
- `startDate`, `endDate`: Schedule validity period
- `isActive`: Enable/disable toggle
- `lastRunDate`, `nextRunDate`: Tracking fields
- Relations to `Business` and `Client`

#### 2. Controller: scheduleController.js
Location: `backend/src/controllers/scheduleController.js`

Functions:
- `getSchedules()`: List all schedules with pagination
- `getSchedule(id)`: Get single schedule details
- `createSchedule()`: Create new recurring schedule
- `updateSchedule(id)`: Update existing schedule
- `deleteSchedule(id)`: Delete schedule
- `toggleScheduleStatus(id)`: Activate/deactivate schedule

#### 3. Cron Service: cronService.js
Location: `backend/src/services/cronService.js`

- Runs automatically at midnight (00:00) every day
- Processes all active schedules
- Creates pending transactions for qualifying schedules
- Updates lastRunDate and calculates nextRunDate
- Console logs for monitoring and debugging

#### 4. Helper Utilities: scheduleHelpers.js
Location: `backend/src/utils/scheduleHelpers.js`

Functions:
- `calculateNextRunDate()`: Determine next execution date
- `shouldRunToday()`: Check if schedule should run
- `validateEnabledDays()`: Validate day selection
- `formatScheduleSummary()`: Format for display

#### 5. Routes
Location: `backend/src/routes/businessOwnerRoutes.js`

```javascript
GET    /api/business-owner/schedules          // List schedules
POST   /api/business-owner/schedules          // Create schedule
GET    /api/business-owner/schedules/:id      // Get schedule
PUT    /api/business-owner/schedules/:id      // Update schedule
DELETE /api/business-owner/schedules/:id      // Delete schedule
PATCH  /api/business-owner/schedules/:id/toggle // Toggle status
```

### Frontend Components

#### 1. Schedules Management Page
Location: `frontend/src/pages/business-owner/SchedulesPage.jsx`

Features:
- Table listing all schedules with pagination
- Filter by client and status (active/inactive)
- Add/Edit/Delete schedule actions
- Toggle schedule activation
- Display last run and next run dates
- Visual day representation

#### 2. Schedule Form Dialog
Location: `frontend/src/components/ScheduleFormDialog.jsx`

Form Elements:
- Schedule name input
- Client dropdown selector
- Amount input field
- Frequency presets: Every Day, Weekdays, Weekly, Custom
- **Day Selector**: Interactive toggle buttons for each day of week
- **Date Range**: Start date and optional end date pickers
- **Excluded Dates**: Multi-date picker for holidays
- Active/Inactive toggle switch

#### 3. Enhanced Transactions Page
Location: `frontend/src/pages/business-owner/RecoveryTransactionsPage.jsx`

Enhancements:
- New "Source" column showing Auto/Manual badge
- Filter by source (Auto-Generated/Manual)
- Color-coded badges for easy identification
- Auto-generated transactions have info chip with refresh icon

#### 4. Navigation
- New "Schedules" menu item in Business Owner sidebar
- Route: `/business-owner/schedules`
- Icon: Schedule (clock) icon

---

## 🎯 User Workflow

### For Business Owners

#### Creating a Schedule

1. **Navigate**: Click "Schedules" in the sidebar
2. **Add New**: Click "Add Schedule" button
3. **Configure**:
   - Enter schedule name (e.g., "Daily Collection - Store A")
   - Select client from dropdown
   - Enter recovery amount
   - Choose frequency preset or customize:
     - Click days of week to enable/disable
     - Set start date (required)
     - Set end date (optional, null = no end)
   - Add excluded dates (holidays, closures)
   - Toggle active/inactive
4. **Save**: Click "Create Schedule"

#### Managing Schedules

- **View**: See all schedules in a table with status, days, dates
- **Edit**: Click edit icon to modify schedule
- **Pause/Resume**: Click pause/play icon to toggle active status
- **Delete**: Click delete icon to remove schedule
- **Filter**: Filter by client or active status

### For Collection Agents

1. **View Transactions**: Navigate to Transactions page
2. **Identify Auto-Generated**: Look for "Auto" badge in Source column
3. **Filter**: Use "Source" filter to show only auto-generated
4. **Collect Payment**: Visit client location
5. **Mark as Paid**: Click "Mark Paid" button
6. **Coins Generated**: System automatically awards coins to client

---

## ⚙️ Technical Details

### Cron Job Specification

**Schedule**: `0 0 * * *` (Every day at midnight)

**Process Flow**:
```
1. Fetch all active schedules
2. For each schedule:
   a. Check if today's day of week is in enabledDays
   b. Check if today is not in excludedDates
   c. Check if within startDate and endDate range
   d. Check if not already ran today
   e. If all checks pass:
      - Create pending RecoveryTransaction
      - Set notes: "Auto-generated from schedule: {name}"
      - Update schedule's lastRunDate
      - Calculate and set nextRunDate
3. Log results (created count, skipped count)
```

### Schedule Validation

Client-side:
- Name required
- Client required
- Amount > 0 required
- At least one day must be selected
- Start date required
- End date must be after start date

Server-side:
- All client-side validations
- Verify client belongs to business
- Validate day array values (0-6)
- Calculate nextRunDate before saving

### Error Handling

- Database errors logged to console
- Transaction creation failures don't stop other schedules
- Frontend displays toast notifications
- Schedule continues on next run even if one execution fails

---

## 🧪 Testing

### Manual Testing Checklist

✅ **Schedule CRUD Operations**
- Create schedule with all fields
- Create schedule with only required fields
- Update schedule details
- Delete schedule
- Toggle schedule status

✅ **Day Selection**
- Select individual days
- Use frequency presets
- Select all days
- Select no days (should show error)

✅ **Date Handling**
- Set start date in future
- Set end date
- Add excluded dates
- Remove excluded dates

✅ **Transaction Generation**
- Create schedule for today
- Wait for cron to run at midnight
- Verify transaction created
- Check transaction has correct notes
- Verify schedule's lastRunDate updated

✅ **Filters and Display**
- Filter by client
- Filter by status (active/inactive)
- Filter by source (auto/manual)
- Pagination works correctly
- View schedule details

✅ **Edge Cases**
- Schedule with end date in past (should not run)
- Schedule with all days excluded
- Multiple schedules for same client
- Schedule for non-existent client (should error)

### Automated Testing (Future)

Recommended test cases:
```javascript
// Unit Tests
- calculateNextRunDate() with various day combinations
- shouldRunToday() with different scenarios
- validateEnabledDays() with valid/invalid input

// Integration Tests
- Create schedule via API
- Fetch schedules with filters
- Toggle schedule status
- Delete schedule

// E2E Tests
- Full schedule creation workflow
- Transaction generation simulation
- Mark auto-generated transaction as paid
```

---

## 📊 Database Schema Updates

### New Collection: `recurring_schedules`

```javascript
{
  _id: ObjectId,
  name: String,
  amount: Number,
  frequency: String,
  enabledDays: [Number],
  excludedDates: [Date],
  isActive: Boolean,
  startDate: Date,
  endDate: Date (nullable),
  lastRunDate: Date (nullable),
  nextRunDate: Date (nullable),
  businessId: ObjectId,
  clientId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Relationships
- `Business` has many `RecurringSchedule`
- `Client` has many `RecurringSchedule`
- `RecurringSchedule` belongs to one `Business`
- `RecurringSchedule` belongs to one `Client`

---

## 🚀 Deployment Checklist

✅ **Backend**
- [x] Install node-cron package
- [x] Update Prisma schema
- [x] Run `prisma generate`
- [x] Run `prisma db push`
- [x] Verify cron service initializes
- [x] Test API endpoints

✅ **Frontend**
- [x] Install @mui/x-date-pickers
- [x] Install date-fns
- [x] Create components
- [x] Add routes
- [x] Update navigation
- [x] Test UI flows

✅ **Production Considerations**
- [ ] Set server timezone correctly
- [ ] Add monitoring for cron job execution
- [ ] Set up alerts for failed schedule processing
- [ ] Document cron schedule for DevOps
- [ ] Consider adding email notifications
- [ ] Add schedule execution history logs

---

## 💡 Example Use Cases

### 1. Daily Weekday Recovery
```
Name: "Daily Recovery - Restaurant A"
Client: Restaurant A
Amount: $100
Days: Mon, Tue, Wed, Thu, Fri
Start: Today
End: None
Excluded: None
```
**Result**: Transaction created every weekday at midnight

### 2. Weekly Saturday Collection
```
Name: "Weekly Collection - Store B"
Client: Store B
Amount: $500
Days: Saturday
Start: Next Saturday
End: +6 months
Excluded: None
```
**Result**: Transaction created every Saturday for 6 months

### 3. Custom Pattern with Holidays
```
Name: "Alternate Days - Shop C"
Client: Shop C
Amount: $75
Days: Mon, Wed, Fri
Start: Today
End: None
Excluded: [Dec 25, 2024], [Jan 1, 2025]
```
**Result**: Transaction created Mon/Wed/Fri, except holidays

---

## 🔧 Troubleshooting

### Issue: Cron job not running
**Check**:
1. Backend console for "✅ Cron service initialized"
2. Server timezone matches expected
3. Backend process running continuously

### Issue: Transactions not created
**Check**:
1. Schedule is active (isActive = true)
2. Today is in enabledDays
3. Today not in excludedDates
4. Within startDate and endDate range
5. Backend console for error messages

### Issue: Wrong schedule time
**Solution**: Cron runs at midnight server time. Adjust server timezone or cron schedule pattern.

---

## 📝 Future Enhancements

Potential improvements:
- [ ] Manual trigger button for testing
- [ ] Schedule execution history table
- [ ] Email notifications on schedule execution
- [ ] SMS notifications to agents
- [ ] Bulk schedule creation from CSV
- [ ] Schedule templates
- [ ] Recurring rules (every N days, every N weeks)
- [ ] Time-based scheduling (specific hours)
- [ ] Conditional schedules (if-then rules)
- [ ] Dashboard widget showing upcoming schedule runs

---

## 📞 Support

For issues or questions:
- Check backend console logs for errors
- Verify database connection
- Check cron service initialization message
- Review schedule validation rules
- Contact system administrator

---

**Last Updated**: February 18, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
