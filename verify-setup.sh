#!/bin/bash

# SmartSchedule Test System Verification Script
# Run this to verify everything is set up correctly

echo "🔍 SmartSchedule Test System Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "${RED}❌ Error: Not in project root directory${NC}"
    exit 1
fi

echo "${GREEN}✅ Project root directory found${NC}"
echo ""

# Check for required files
echo "📁 Checking files..."

check_file() {
    if [ -f "$1" ]; then
        echo "${GREEN}✅${NC} $1"
        return 0
    else
        echo "${RED}❌${NC} $1 (missing)"
        return 1
    fi
}

MISSING=0

# Migration
check_file "supabase/migrations/20251027_test_system_refinements.sql" || MISSING=$((MISSING+1))

# Type schema
check_file "src/types/test-schema.ts" || MISSING=$((MISSING+1))

# Fixtures
check_file "tests/fixtures/room.fixture.ts" || MISSING=$((MISSING+1))
check_file "tests/fixtures/academic-term.fixture.ts" || MISSING=$((MISSING+1))
check_file "tests/fixtures/schedule-versions.fixture.ts" || MISSING=$((MISSING+1))
check_file "tests/fixtures/index.ts" || MISSING=$((MISSING+1))

# Test utilities
check_file "tests/utils/test-helpers.ts" || MISSING=$((MISSING+1))
check_file "tests/utils/yjs-test-utils.ts" || MISSING=$((MISSING+1))

# Unit tests
check_file "tests/unit/validators/preference-validator.test.ts" || MISSING=$((MISSING+1))
check_file "tests/unit/validators/conflict-detector.test.ts" || MISSING=$((MISSING+1))
check_file "tests/unit/validators/capacity-validator.test.ts" || MISSING=$((MISSING+1))

echo ""

if [ $MISSING -eq 0 ]; then
    echo "${GREEN}✅ All files present (11/11)${NC}"
else
    echo "${RED}❌ Missing $MISSING file(s)${NC}"
    exit 1
fi

echo ""

# Check for node_modules
if [ -d "node_modules" ]; then
    echo "${GREEN}✅ node_modules installed${NC}"
else
    echo "${YELLOW}⚠️  node_modules not found. Run: npm install${NC}"
fi

echo ""

# Check package.json for test script
if grep -q '"test"' package.json; then
    echo "${GREEN}✅ Test script found in package.json${NC}"
else
    echo "${RED}❌ No test script in package.json${NC}"
    MISSING=$((MISSING+1))
fi

echo ""

# Count test files
TEST_COUNT=$(find tests/unit -name "*.test.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "📊 Test Statistics:"
echo "   Unit test files: $TEST_COUNT"

# Count fixture files
FIXTURE_COUNT=$(find tests/fixtures -name "*.fixture.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "   Fixture files: $FIXTURE_COUNT"

# Count documentation files
DOC_COUNT=$(find . -maxdepth 1 -name "*-*.md" 2>/dev/null | wc -l | tr -d ' ')
echo "   Documentation files: $DOC_COUNT"

echo ""

# Final summary
echo "=========================================="
if [ $MISSING -eq 0 ]; then
    echo "${GREEN}✅ VERIFICATION PASSED${NC}"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Apply migration: supabase db push"
    echo "   2. Run tests: npm test"
    echo "   3. Review docs: VERIFICATION-REPORT.md"
else
    echo "${RED}❌ VERIFICATION FAILED${NC}"
    echo ""
    echo "Fix missing files and run again."
    exit 1
fi

echo ""

