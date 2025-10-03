#!/bin/bash
# API Testing Script for Phase 3 Backend
# Run after: npm run dev

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing SmartSchedule Phase 3 APIs"
echo "========================================"
echo ""

# Test 1: Get all courses
echo "📚 Test 1: GET /api/courses"
curl -s "${BASE_URL}/courses" | jq '.[] | {code, name, sections: (.sections | length)}'
echo ""

# Test 2: Get courses by type
echo "📚 Test 2: GET /api/courses?type=REQUIRED"
curl -s "${BASE_URL}/courses?type=REQUIRED" | jq '.[] | {code, name, type}'
echo ""

# Test 3: Get all sections
echo "📋 Test 3: GET /api/sections"
curl -s "${BASE_URL}/sections" | jq '.[] | {id, instructor, room, times: (.times | length)}' | head -20
echo ""

# Test 4: Get sections for a course
echo "📋 Test 4: GET /api/sections?course=SWE211"
curl -s "${BASE_URL}/sections?course=SWE211" | jq '.[] | {id, instructor, room}'
echo ""

# Test 5: Get all exams
echo "📝 Test 5: GET /api/exams"
curl -s "${BASE_URL}/exams" | jq '.[] | {courseCode, type, date, time}'
echo ""

# Test 6: Get exams for a course
echo "📝 Test 6: GET /api/exams?course=SWE211"
curl -s "${BASE_URL}/exams?course=SWE211" | jq '.[] | {type, date, time}'
echo ""

# Test 7: Check conflicts
echo "⚠️  Test 7: GET /api/conflicts"
curl -s "${BASE_URL}/conflicts" | jq '{isValid, conflictCount: (.conflicts | length), conflicts: .conflicts}'
echo ""

# Test 8: Get rules
echo "📜 Test 8: GET /api/rules"
curl -s "${BASE_URL}/rules" | jq '.[] | {key, name, severity}'
echo ""

# Test 9: Get preferences
echo "🎯 Test 9: GET /api/preferences"
curl -s "${BASE_URL}/preferences" | jq '.[] | {studentId, courseCode, priority}' | head -20
echo ""

# Test 10: Get irregular students
echo "👥 Test 10: GET /api/irregular"
curl -s "${BASE_URL}/irregular" | jq '.[] | {id, name, requiredCourses}'
echo ""

# Test 11: Get comments
echo "💬 Test 11: GET /api/comments"
curl -s "${BASE_URL}/comments" | jq '.[] | {authorName, targetType, text}' | head -10
echo ""

# Test 12: Get notifications
echo "🔔 Test 12: GET /api/notifications"
curl -s "${BASE_URL}/notifications" | jq '.[] | {title, type, readAt}' | head -10
echo ""

echo "========================================"
echo "✅ API tests complete!"
echo ""
echo "💡 Tips:"
echo "  - Install jq for pretty JSON: brew install jq"
echo "  - Use Postman/Insomnia for interactive testing"
echo "  - Check server logs for detailed errors"
echo "  - Data resets on server restart (in-memory)"
