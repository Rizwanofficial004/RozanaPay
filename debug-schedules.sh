#!/bin/bash

# Debug script to check schedules
echo "🔍 Debugging Schedules"
echo "====================="
echo ""

# Get today's info
TODAY=$(date +%A)
DAY_NUM=$(date +%u)  # 1-7 (Monday-Sunday)
DAY_NUM=$((DAY_NUM % 7))  # Convert to 0-6 (Sunday-Saturday)

echo "📅 Today is: $TODAY (Day $DAY_NUM in 0-6 format)"
echo ""

# Login
echo "🔐 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@business.com","password":"owner123"}')

if command -v jq &> /dev/null; then
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
else
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"data":{"token":"[^"]*' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to login"
    exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Get all schedules
echo "📋 Fetching all schedules..."
SCHEDULES=$(curl -s -X GET "http://localhost:5000/api/business-owner/schedules?limit=100" \
  -H "Authorization: Bearer $TOKEN")

echo "$SCHEDULES" | jq . 2>/dev/null || echo "$SCHEDULES"
echo ""

# Count schedules
if command -v jq &> /dev/null; then
    SCHEDULE_COUNT=$(echo $SCHEDULES | jq '.schedules | length')
    echo "📊 Total Schedules: $SCHEDULE_COUNT"
    echo ""
    
    # Check each schedule
    echo "🔍 Checking if schedules should run today (Day $DAY_NUM):"
    echo "---------------------------------------------------"
    
    echo $SCHEDULES | jq -r '.schedules[] | "
Schedule: \(.name)
  Client: \(.client.name)
  Amount: PKR \(.amount)
  Active: \(.isActive)
  Enabled Days: \(.enabledDays | tostring)
  Should run today: \(if (.enabledDays | index('$DAY_NUM')) then "✅ YES" else "❌ NO (Day '$DAY_NUM' not in enabled days)" end)
  Last Run: \(.lastRunDate // "Never")
  Next Run: \(.nextRunDate // "Not calculated")
  Start Date: \(.startDate)
  End Date: \(.endDate // "No end date")
---------------------------------------------------"'
fi

echo ""
echo "💡 Tips:"
echo "  - Make sure today's day ($DAY_NUM) is in enabledDays array"
echo "  - Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6"
echo "  - Check if schedules are Active (isActive: true)"
echo "  - Check if lastRunDate is NOT today (to avoid duplicates)"
