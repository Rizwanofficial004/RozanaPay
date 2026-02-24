# 🧪 Testing Cron Job Manually

## Quick Command (cURL)

Run this command in your terminal to trigger the cron job immediately:

```bash
curl -X POST http://localhost:5000/api/business-owner/schedules/trigger-cron \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## How to Get Your Token

### Option 1: From Browser DevTools
1. Login to your app as Business Owner
2. Open Browser DevTools (F12)
3. Go to Application → Local Storage → http://localhost:5173
4. Copy the value of `auth-storage` → `state` → `token`

### Option 2: Login via API First
```bash
# Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@business.com",
    "password": "owner123"
  }'

# Copy the token from response, then use it in the trigger command
```

## Complete Example

```bash
# 1. Login first
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@business.com","password":"owner123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Trigger cron job
curl -X POST http://localhost:5000/api/business-owner/schedules/trigger-cron \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

## Using Postman

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/business-owner/schedules/trigger-cron`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_TOKEN`
4. **Click Send**

## What Happens

When you trigger the cron job:

✅ Checks all active schedules
✅ Evaluates which should run today
✅ Creates pending transactions
✅ Updates schedule tracking
✅ Shows results in backend console

### Console Output Example:
```
🔧 Manual cron trigger requested by: owner@business.com
📅 Processing schedules for Tue Feb 18 2026 (Day 2)
📋 Found 3 active schedules
✅ Created transaction for schedule: Daily Recovery - Store A
⏭️  Skipped schedule: Weekend Collection
✅ Created transaction for schedule: Weekday Schedule
✨ Job completed: 2 transactions created, 1 schedules skipped
```

## Response

**Success:**
```json
{
  "success": true,
  "message": "Cron job executed successfully! Check console logs for details."
}
```

**Error:**
```json
{
  "success": false,
  "message": "Failed to execute cron job",
  "error": "error details here"
}
```

## Verify Transactions Created

After running the cron:

1. Go to Transactions page
2. Look for transactions with "Auto" badge
3. Notes will say: "Auto-generated from schedule: [name]"
4. Check backend console for detailed logs

## Tips

- You can run this multiple times to test
- Each run checks if already ran today (won't duplicate)
- Check backend terminal for detailed logs
- Transactions created will be in "pending" status
- Test with different day schedules

---

**Endpoint:** `POST /api/business-owner/schedules/trigger-cron`  
**Auth Required:** Yes (Business Owner)  
**Ready to Use:** ✅ Yes, server is running
