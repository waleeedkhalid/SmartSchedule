#!/bin/bash

###############################################################################
# Navigation Performance Test Script
# 
# Tests navigation speed improvements after optimization
# Run this script to verify performance gains
#
# Usage:
#   chmod +x scripts/test-navigation-performance.sh
#   ./scripts/test-navigation-performance.sh
###############################################################################

echo "🚀 Navigation Performance Test"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if Next.js server is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "${YELLOW}⚠️  Next.js server not running. Please start it with:${NC}"
    echo "   npm run dev"
    exit 1
fi

echo "${GREEN}✅ Server is running${NC}"
echo ""

# Test routes
ROUTES=(
    "/"
    "/student/dashboard"
    "/student/schedule"
    "/student/electives"
    "/faculty/dashboard"
    "/committee/scheduler"
)

echo "🧪 Testing Navigation Performance"
echo "---------------------------------"
echo ""

for route in "${ROUTES[@]}"; do
    echo "Testing: $route"
    
    # Measure time to first byte (TTFB)
    ttfb=$(curl -o /dev/null -s -w '%{time_starttransfer}\n' "http://localhost:3000$route")
    
    # Convert to milliseconds
    ttfb_ms=$(echo "$ttfb * 1000" | bc)
    
    # Color code based on performance
    if (( $(echo "$ttfb_ms < 200" | bc -l) )); then
        echo "  ${GREEN}✅ TTFB: ${ttfb_ms}ms (Excellent)${NC}"
    elif (( $(echo "$ttfb_ms < 500" | bc -l) )); then
        echo "  ${GREEN}✅ TTFB: ${ttfb_ms}ms (Good)${NC}"
    else
        echo "  ${YELLOW}⚠️  TTFB: ${ttfb_ms}ms (Needs optimization)${NC}"
    fi
    
    echo ""
done

echo "=============================="
echo "📊 Performance Test Complete"
echo ""
echo "💡 Tips:"
echo "   - TTFB < 200ms = Excellent"
echo "   - TTFB < 500ms = Good"
echo "   - TTFB > 500ms = Needs optimization"
echo ""
echo "🔍 For detailed analysis:"
echo "   - Check Vercel Speed Insights"
echo "   - Run: npm run build && npm run start"
echo "   - Use Chrome DevTools Performance tab"
echo ""

