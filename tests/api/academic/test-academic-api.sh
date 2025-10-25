#!/bin/bash

# Academic API Manual Test Script
# This script tests all academic API endpoints manually

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
TEST_TERM_CODE="471"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Academic API Manual Test Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "API Base URL: $API_BASE_URL"
echo "Test Term Code: $TEST_TERM_CODE"
echo ""

# Note about authentication
echo -e "${YELLOW}⚠️  Note: This script requires authentication.${NC}"
echo -e "${YELLOW}   Make sure you're logged in and have a valid session.${NC}"
echo ""

# Function to print test header
print_test() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}TEST: $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to make authenticated request
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  if [ -z "$data" ]; then
    curl -s -X "$method" \
      -H "Content-Type: application/json" \
      -w "\nHTTP_STATUS:%{http_code}" \
      "$API_BASE_URL$endpoint"
  else
    curl -s -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      -w "\nHTTP_STATUS:%{http_code}" \
      "$API_BASE_URL$endpoint"
  fi
}

# Function to check response
check_response() {
  local response=$1
  local expected_status=$2
  
  # Extract HTTP status
  local status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
  local body=$(echo "$response" | sed '/HTTP_STATUS:/d')
  
  echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
  echo "Status: $status"
  
  if [ "$status" = "$expected_status" ]; then
    print_success "Status code $status (expected)"
    return 0
  else
    print_error "Status code $status (expected $expected_status)"
    return 1
  fi
}

# =============================================================================
# TEST 1: Get All Academic Terms
# =============================================================================
print_test "GET /api/academic/terms - Get all academic terms"
response=$(make_request "GET" "/api/academic/terms")
check_response "$response" "200"

# =============================================================================
# TEST 2: Get Active Terms
# =============================================================================
print_test "GET /api/academic/terms?active=true - Get active terms only"
response=$(make_request "GET" "/api/academic/terms?active=true")
check_response "$response" "200"

# =============================================================================
# TEST 3: Get All Events
# =============================================================================
print_test "GET /api/academic/events - Get all term events"
response=$(make_request "GET" "/api/academic/events")
check_response "$response" "200"

# =============================================================================
# TEST 4: Get Events for Specific Term
# =============================================================================
print_test "GET /api/academic/events?term_code=$TEST_TERM_CODE - Get events for term"
response=$(make_request "GET" "/api/academic/events?term_code=$TEST_TERM_CODE")
check_response "$response" "200"

# =============================================================================
# TEST 5: Get Events by Type
# =============================================================================
print_test "GET /api/academic/events?event_type=registration - Filter by event type"
response=$(make_request "GET" "/api/academic/events?event_type=registration")
check_response "$response" "200"

# =============================================================================
# TEST 6: Get Events by Category
# =============================================================================
print_test "GET /api/academic/events?category=exam - Filter by category"
response=$(make_request "GET" "/api/academic/events?category=exam")
check_response "$response" "200"

# =============================================================================
# TEST 7: Get Upcoming Events
# =============================================================================
print_test "GET /api/academic/events?upcoming=true&days_ahead=30 - Get upcoming events"
response=$(make_request "GET" "/api/academic/events?upcoming=true&days_ahead=30")
check_response "$response" "200"

# =============================================================================
# TEST 8: Get Active Events
# =============================================================================
print_test "GET /api/academic/events?active=true - Get currently active events"
response=$(make_request "GET" "/api/academic/events?active=true")
check_response "$response" "200"

# =============================================================================
# TEST 9: Get Timeline for Term
# =============================================================================
print_test "GET /api/academic/timeline/$TEST_TERM_CODE - Get comprehensive timeline"
response=$(make_request "GET" "/api/academic/timeline/$TEST_TERM_CODE")
check_response "$response" "200"

# =============================================================================
# TEST 10: Get Timeline with Custom days_ahead
# =============================================================================
print_test "GET /api/academic/timeline/$TEST_TERM_CODE?days_ahead=15 - Timeline with custom range"
response=$(make_request "GET" "/api/academic/timeline/$TEST_TERM_CODE?days_ahead=15")
check_response "$response" "200"

# =============================================================================
# TEST 11: Create New Event (Committee Role Required)
# =============================================================================
print_test "POST /api/academic/events - Create new event (requires committee role)"
new_event='{
  "term_code": "'$TEST_TERM_CODE'",
  "title": "Test Event",
  "description": "This is a test event created by the test script",
  "event_type": "other",
  "category": "academic",
  "start_date": "2024-10-01T08:00:00Z",
  "end_date": "2024-10-01T23:59:59Z",
  "is_recurring": false,
  "metadata": {"test": true}
}'
response=$(make_request "POST" "/api/academic/events" "$new_event")
# Will be 201 if user has committee role, 403 if not
if echo "$response" | grep -q "HTTP_STATUS:201"; then
  check_response "$response" "201"
  # Extract event ID for cleanup
  event_id=$(echo "$response" | sed '/HTTP_STATUS:/d' | jq -r '.data.id' 2>/dev/null)
  echo -e "${GREEN}Created event ID: $event_id${NC}"
elif echo "$response" | grep -q "HTTP_STATUS:403"; then
  check_response "$response" "403"
  echo -e "${YELLOW}Note: User doesn't have committee role (expected for students/faculty)${NC}"
else
  check_response "$response" "201"
fi

# =============================================================================
# TEST 12: Get Non-existent Event
# =============================================================================
print_test "GET /api/academic/events/00000000-0000-0000-0000-000000000000 - Non-existent event"
response=$(make_request "GET" "/api/academic/events/00000000-0000-0000-0000-000000000000")
check_response "$response" "404"

# =============================================================================
# TEST 13: Get Non-existent Term Timeline
# =============================================================================
print_test "GET /api/academic/timeline/999 - Non-existent term timeline"
response=$(make_request "GET" "/api/academic/timeline/999")
check_response "$response" "404"

# =============================================================================
# Cleanup (if event was created)
# =============================================================================
if [ ! -z "$event_id" ] && [ "$event_id" != "null" ]; then
  print_test "DELETE /api/academic/events/$event_id - Cleanup test event"
  response=$(make_request "DELETE" "/api/academic/events/$event_id")
  if echo "$response" | grep -q "HTTP_STATUS:200"; then
    check_response "$response" "200"
    print_success "Test event cleaned up successfully"
  else
    echo -e "${YELLOW}Note: Could not delete test event (may require committee role)${NC}"
  fi
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All manual API endpoint tests completed${NC}"
echo ""
echo "Next steps:"
echo "1. Review the responses above for any errors"
echo "2. Run automated tests with: npm run test tests/api/academic/"
echo "3. Check the database to verify data integrity"
echo ""

