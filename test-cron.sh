#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Cron Job Manually${NC}"
echo "================================"
echo ""

# Step 1: Login and get token
echo -e "${YELLOW}Step 1: Logging in as Business Owner...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@business.com",
    "password": "owner123"
  }')

# Extract token (works on Linux/Mac with jq installed)
if command -v jq &> /dev/null; then
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
else
    # Fallback without jq - extract from nested data.token
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"data":{"token":"[^"]*' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}❌ Failed to login. Please check credentials.${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Login successful!${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Trigger cron job
echo -e "${YELLOW}Step 2: Triggering cron job...${NC}"
CRON_RESPONSE=$(curl -s -X POST http://localhost:5000/api/business-owner/schedules/trigger-cron \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "$CRON_RESPONSE" | jq . 2>/dev/null || echo "$CRON_RESPONSE"
echo ""

# Check if successful
if echo "$CRON_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Cron job executed successfully!${NC}"
    echo -e "${BLUE}Check your backend terminal for detailed logs.${NC}"
    echo -e "${BLUE}Go to Transactions page to see auto-generated transactions.${NC}"
else
    echo -e "${RED}❌ Cron job execution failed.${NC}"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Test Complete!${NC}"
