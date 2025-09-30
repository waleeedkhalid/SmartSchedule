#!/bin/bash

# API Test Script for SmartSchedule Backend
# Run this after starting the dev server (npm run dev)

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing SmartSchedule APIs..."
echo "================================"

# Test 1: Get all courses
echo "
📚 Test 1: GET /api/courses"
curl -s $BASE_URL/courses | jq '.[] | {code, name, type}' | head -20

# Test 2: Get elective courses only
echo "
🎓 Test 2: GET /api/courses?type=ELECTIVE"
curl -s "$BASE_URL/courses?type=ELECTIVE" | jq '.[] | {code, name}'

# Test 3: Get all sections
echo "
📋 Test 3: GET /api/sections"
curl -s $BASE_URL/sections | jq 'length'
echo " sections found"

# Test 4: Get all rules
echo "
⚖️  Test 4: GET /api/rules"
curl -s $BASE_URL/rules | jq '.[] | {key, label, active}'

# Test 5: Check conflicts
echo "
⚠️  Test 5: GET /api/conflicts"
curl -s $BASE_URL/conflicts | jq '.isValid, .conflicts | length'

# Test 6: Get instructor load overview
echo "
👨‍🏫 Test 6: GET /api/load/overview"
curl -s $BASE_URL/load/overview | jq '.[] | {name: .instructor.name, totalHours, isOverloaded}'

# Test 7: Get external slots
echo "
🌐 Test 7: GET /api/external-slots"
curl -s $BASE_URL/external-slots | jq 'length'
echo " external slots found"

# Test 8: Create a section
echo "
➕ Test 8: POST /api/sections (create)"
COURSE_ID=$(curl -s $BASE_URL/courses | jq -r '.[0].id')
curl -s -X POST $BASE_URL/sections \
  -H "Content-Type: application/json" \
  -d "{\"courseId\":\"$COURSE_ID\",\"index\":1,\"capacity\":30}" \
  | jq '{id, courseId, index, capacity}'

# Test 9: Get student preferences
echo "
⭐ Test 9: GET /api/preferences"
curl -s $BASE_URL/preferences | jq 'length'
echo " preferences found"

# Test 10: Get public schedule
echo "
📅 Test 10: GET /api/schedule/public"
curl -s $BASE_URL/schedule/public | jq '{sweSections: (.sweSections | length), externalSlots: (.externalSlots | length)}'

echo "
✅ API tests complete!"
