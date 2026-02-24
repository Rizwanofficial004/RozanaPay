# 🚀 RECURRING SCHEDULER - QUICK START GUIDE

## ⚡ 60-Second Overview

**What it does**: Automatically creates recovery transactions every night based on your schedules. No more manual daily entry!

**How it works**:
1. You create a schedule (which days, amount, client)
2. System creates transactions automatically at midnight
3. Agent marks them as paid when collecting money
4. Coins are awarded automatically

---

## 🎯 Quick Start (5 Steps)

### 1. Create Your First Schedule

```
Login → Schedules → Add Schedule

Fill in:
- Name: "Daily Recovery - Store A"
- Client: Select your client
- Amount: 100
- Days: Click Mon, Tue, Wed, Thu, Fri
- Click "Create Schedule"
```

### 2. View Active Schedules

```
Schedules page shows:
- Schedule name
- Client
- Amount
- Which days
- Last run date
- Next run date
- Status (Active/Inactive)
```

### 3. Manage Schedules

```
Actions available:
- 🟢 Play/Pause icon: Activate or deactivate
- ✏️ Edit icon: Modify schedule
- 🗑️ Delete icon: Remove schedule
- Filters: By client or status
```

### 4. View Auto-Generated Transactions

```
Transactions page:
- "Source" column shows "Auto" badge
- Filter by "Auto-Generated" to see only scheduled ones
- Notes say: "Auto-generated from schedule: [name]"
```

### 5. Agent Workflow

```
Daily routine:
1. Open Transactions
2. Filter by "Auto" (optional)
3. Visit client → Collect money
4. Click "Mark as Paid"
5. Done! (Coins awarded automatically)
```

---

## 📅 Common Schedule Patterns

### Pattern 1: Weekdays Only
```
Days: Mon, Tue, Wed, Thu, Fri
Amount: $100
Start: Today
End: None
```
**Result**: Transaction created every weekday

### Pattern 2: Weekly Collection
```
Days: Saturday only
Amount: $500
Start: This Saturday
End: +6 months
```
**Result**: Transaction every Saturday for 6 months

### Pattern 3: Alternate Days
```
Days: Mon, Wed, Fri
Amount: $75
Start: Today
End: None
Excluded: Add holidays
```
**Result**: Mon/Wed/Fri only, skips holidays

### Pattern 4: Every Day
```
Days: Sun, Mon, Tue, Wed, Thu, Fri, Sat
Amount: $50
Start: Tomorrow
End: None
```
**Result**: Daily transactions

---

## 🔧 Tips & Tricks

### Frequency Presets (Shortcuts)
- **"Every Day"** button: Selects all 7 days instantly
- **"Weekdays Only"** button: Mon-Fri only
- **"Weekly"** button: Monday only (change if needed)
- **"Custom"** button: Clear selection, pick your own

### Excluding Holidays
```
1. Click "Add Excluded Date" picker
2. Select holiday date
3. It appears as a chip
4. Click X on chip to remove
5. Add multiple holidays easily
```

### Pausing vs Deleting
- **Pause** (⏸️): Keeps schedule but stops running
  - Use for temporary client breaks
  - Can resume anytime
  
- **Delete** (🗑️): Permanently removes schedule
  - Use when client relationship ends
  - Cannot undo

### End Date Strategy
- **No end date**: Schedule runs forever (good for ongoing clients)
- **With end date**: Auto-stops after date (good for contracts)

---

## ❓ FAQ

**Q: When do transactions get created?**  
A: Every night at midnight (00:00 server time)

**Q: Can I test without waiting for midnight?**  
A: Currently no, but you can manually create a transaction to simulate

**Q: What if I need to skip a day?**  
A: Add that date to "Excluded Dates" in the schedule

**Q: Can I have multiple schedules for one client?**  
A: Yes! For example, one for weekdays ($100) and one for weekends ($150)

**Q: What happens if I edit a schedule?**  
A: Changes apply from the next run. Past transactions are not affected.

**Q: Can I change the amount?**  
A: Yes, edit the schedule. New amount applies from next run.

**Q: What if a client stops paying?**  
A: Pause or delete their schedule. You can still manually mark existing transactions.

---

## 🎨 Visual Guide

### Day Selector
```
[Sun] [Mon] [Tue] [Wed] [Thu] [Fri] [Sat]
 ⬜    ✅    ✅    ✅    ✅    ✅    ⬜

Selected days are highlighted in blue
```

### Source Badges
```
Auto Badge: 🔵 Auto     (blue chip with refresh icon)
Manual Badge: ⚪ Manual (outlined chip)
```

### Schedule Status
```
Active: 🟢 Active      (green chip)
Inactive: ⚫ Inactive  (gray chip)
```

---

## 🚨 Troubleshooting

### "No transactions created overnight"
**Check**:
- ✅ Schedule is Active (green chip)
- ✅ Today's day is selected in schedule
- ✅ Today is not in Excluded Dates
- ✅ Backend server is running
- ✅ It's after midnight

### "Can't save schedule"
**Check**:
- ✅ All required fields filled
- ✅ At least one day selected
- ✅ Amount is greater than 0
- ✅ Client selected

### "Schedule not showing"
**Check**:
- ✅ Filters cleared (show "All Clients", "All Status")
- ✅ Refresh page
- ✅ Check pagination (maybe on another page)

---

## 📱 Demo Credentials

To test the feature:

```
Business Owner Account:
Email: owner@business.com
Password: owner123

Test with demo clients already in system!
```

---

## 🎯 Best Practices

1. **Naming Convention**: Use descriptive names
   - ✅ "Daily Recovery - Restaurant A"
   - ❌ "Schedule 1"

2. **Review Schedules Weekly**: Check if any need updating

3. **Use Excluded Dates**: Add known holidays in advance

4. **Group Similar Patterns**: 
   - One schedule for weekday clients
   - Different for weekend clients

5. **Monitor Transactions**: Check "Auto" filter regularly

---

## 📊 At a Glance

| Feature | Status | Access |
|---------|--------|--------|
| Create Schedule | ✅ | Schedules page → Add Schedule |
| Edit Schedule | ✅ | Click edit icon |
| Delete Schedule | ✅ | Click delete icon |
| Pause/Resume | ✅ | Click play/pause icon |
| View Auto Transactions | ✅ | Transactions page → Filter by Auto |
| Day Selection | ✅ | Toggle buttons in form |
| Exclude Dates | ✅ | Date picker in form |
| Filter Schedules | ✅ | Dropdown filters on page |

---

## 🔗 Navigation Path

```
Dashboard → Sidebar → Schedules
or
Dashboard → Transactions → (view auto-generated)
```

---

## ⏰ Cron Schedule

```
Pattern: 0 0 * * *
Means: Every day at 00:00 (midnight)
Timezone: Server local time
```

---

## 🎉 You're Ready!

Now you can:
- ✅ Create automatic recovery schedules
- ✅ Let the system create transactions for you
- ✅ Focus on collection, not data entry
- ✅ Manage everything with a beautiful interface

**Start creating your first schedule now! 🚀**

---

**Need Help?** Check `RECURRING_SCHEDULER_DOCS.md` for detailed documentation.
